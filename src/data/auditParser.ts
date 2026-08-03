import * as XLSX from 'xlsx';
import type { AuditDataset, AuditRecord, DatasetMeta, ParsedAuditAction } from '../types/audit';

const HEADER_ROW_INDEX = 1;
const DATA_START_ROW_INDEX = 2;

const REQUIRED_HEADERS = {
  date: 'Fecha',
  auditor: 'Auditor',
  eventId: 'ID del evento',
  sourceMedium: 'Medio de origen',
  operator: 'Operador auditado',
  delaySae: 'Demora en crear hecho en SAE',
  action: 'Acción tomada',
  affectedSystem: 'Sistema afectado',
  correctionReason: 'Motivo de corrección',
  additionalNotes: 'Observaciones adicionales',
} as const;

type HeaderKey = keyof typeof REQUIRED_HEADERS;

const HEADER_MATCHES: Record<HeaderKey, string[]> = {
  date: ['fecha'],
  auditor: ['auditor'],
  eventId: ['id del evento'],
  sourceMedium: ['medio de origen'],
  operator: ['operador auditado'],
  delaySae: ['demora en crear hecho en sae'],
  action: ['accion tomada'],
  affectedSystem: ['sistema afectado'],
  correctionReason: ['motivo de correccion'],
  additionalNotes: ['observaciones adicionales'],
};

const normalizeKey = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getVisibleSheetNames = (workbook: XLSX.WorkBook) =>
  workbook.SheetNames.filter((_, index) => {
    const hiddenState = workbook.Workbook?.Sheets?.[index]?.Hidden ?? 0;
    return hiddenState === 0;
  });

const selectAuditSheetName = (workbook: XLSX.WorkBook, meta: DatasetMeta) => {
  const visibleSheetNames = getVisibleSheetNames(workbook);
  const candidateSheetNames = visibleSheetNames.length ? visibleSheetNames : workbook.SheetNames;
  const expectedSheetName = normalizeKey(meta.monthLabel);
  const matchingSheetName =
    candidateSheetNames.find((sheetName) => normalizeKey(sheetName) === expectedSheetName) ??
    candidateSheetNames.find((sheetName) => normalizeKey(sheetName).includes(expectedSheetName));

  return matchingSheetName ?? candidateSheetNames[0];
};

const normalizeText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(/\s+/g, ' ');
  if (!text || text === '-') return null;
  return text;
};

const normalizeName = (value: unknown) => {
  const text = normalizeText(value);
  if (!text) return 'Accion desconocida';
  return text
    .toLocaleLowerCase('es-AR')
    .replace(/(^|\s|[-.])\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-AR'));
};

const normalizeAction = (value: unknown): ParsedAuditAction | null => {
  const text = normalizeKey(value);
  if (!text) return null;
  if (text === 'validado') return 'Validado';
  if (text === 'corregido') return 'Corregido';
  if (text === 'observado') return 'Observado';
  return 'Accion desconocida';
};

const parseDelay = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = normalizeText(value);
  if (!text) return null;
  const numeric = Number(text.replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const parseDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const text = normalizeText(value);
  if (!text) return null;
  const [day, month, year] = text.split(/[/-]/).map(Number);
  if (day && month && year) return new Date(year, month - 1, day);
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const isEmptyRow = (row: unknown[]) => row.every((cell) => normalizeText(cell) === null);

const mapHeaders = (rows: unknown[][]) => {
  const headerRow = rows[HEADER_ROW_INDEX] ?? [];
  const headerMap = new Map<string, number>();
  headerRow.forEach((header, index) => headerMap.set(normalizeKey(header), index));

  return Object.entries(REQUIRED_HEADERS).reduce<Record<HeaderKey, number>>((acc, [key, label]) => {
    const expectedHeaders = HEADER_MATCHES[key as HeaderKey] ?? [normalizeKey(label)];
    const exactColumnIndex = expectedHeaders.map((expectedHeader) => headerMap.get(expectedHeader)).find((index) => index !== undefined);
    const compatibleColumn = Array.from(headerMap.entries()).find(([actualHeader]) => expectedHeaders.some((expectedHeader) => actualHeader.startsWith(expectedHeader)));
    const columnIndex = exactColumnIndex ?? compatibleColumn?.[1];
    acc[key as HeaderKey] = columnIndex ?? -1;
    return acc;
  }, {} as Record<HeaderKey, number>);
};

const toRecord = (row: unknown[], headers: Record<HeaderKey, number>): AuditRecord | null => {
  const value = (key: HeaderKey) => row[headers[key]];
  const date = parseDate(value('date'));
  const auditor = normalizeName(value('auditor'));
  const eventId = normalizeText(value('eventId'));
  const operator = normalizeName(value('operator'));
  const action = normalizeAction(value('action'));

  if (!date || !auditor || !eventId || !operator || !action) return null;

  return {
    date,
    auditor,
    eventId: String(eventId),
    sourceMedium: normalizeText(value('sourceMedium')),
    operator,
    delaySae: parseDelay(value('delaySae')),
    action,
    affectedSystem: normalizeText(value('affectedSystem')),
    correctionReason: normalizeText(value('correctionReason')),
    additionalNotes: normalizeText(value('additionalNotes')),
  };
};

export const parseAuditWorkbook = (buffer: ArrayBuffer, meta: DatasetMeta): AuditDataset => {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = selectAuditSheetName(workbook, meta);
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: false });
  const headers = mapHeaders(rows);
  const missingHeaders = Object.entries(headers)
    .filter(([, index]) => index < 0)
    .map(([key]) => REQUIRED_HEADERS[key as HeaderKey]);

  if (missingHeaders.length > 0) {
    throw new Error(`El archivo no contiene todos los encabezados requeridos en la fila 2: ${missingHeaders.join(', ')}.`);
  }

  const records = rows
    .slice(DATA_START_ROW_INDEX)
    .filter((row) => !isEmptyRow(row))
    .map((row) => toRecord(row, headers))
    .filter((record): record is AuditRecord => Boolean(record));

  const lastUpdated = records.reduce<Date | null>((latest, record) => {
    if (!latest || record.date > latest) return record.date;
    return latest;
  }, null);

  return {
    meta: { ...meta, lastUpdated },
    records,
  };
};
