import * as XLSX from 'xlsx';
import type { ShiftCode, ShiftRoster } from '../domain/shift-types';
import { normalizePersonName } from '../utils/normalize-person-name';

const TARGET_SHEET = 'POR TURNO';

const detectShift = (row: unknown[]): ShiftCode | null => {
  const rowText = row.map((cell) => String(cell ?? '')).join(' ');
  const match = rowText.match(/TURNO\s+(GL|[A-G])/i);
  if (!match?.[1]) return null;
  const shift = match[1].toUpperCase();
  return (shift === 'G' ? 'GL' : shift) as ShiftCode;
};

const isStopRow = (row: unknown[]) => String(row[0] ?? '').toLocaleUpperCase('es-AR').includes('SUP. TURNO');

const normalizeCell = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');

export const parseShiftRosterWorkbook = (buffer: ArrayBuffer): ShiftRoster => {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[TARGET_SHEET];
  if (!sheet) throw new Error(`No se encontro la hoja ${TARGET_SHEET} en la nomina por turno.`);

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: false });
  let currentShift: ShiftCode | null = null;
  let nameColumnIndex = -1;

  const members = rows.flatMap((row) => {
    if (isStopRow(row)) {
      currentShift = null;
      return [];
    }

    const detectedShift = detectShift(row);
    if (detectedShift) {
      currentShift = detectedShift;
      nameColumnIndex = -1;
      return [];
    }

    const headerIndex = row.findIndex((cell) => normalizeCell(cell).toLocaleUpperCase('es-AR') === 'APELLIDO Y NOMBRE');
    if (headerIndex >= 0) {
      nameColumnIndex = headerIndex;
      return [];
    }

    if (!currentShift || nameColumnIndex < 0) return [];

    const originalName = normalizeCell(row[nameColumnIndex]);
    if (!originalName || originalName.toLocaleUpperCase('es-AR') === 'APELLIDO Y NOMBRE') return [];
    if (!row[0] || Number.isNaN(Number(row[0]))) return [];

    return [
      {
        originalName,
        normalizedName: normalizePersonName(originalName),
        shift: currentShift,
      },
    ];
  });

  const uniqueMembers = new Map<string, (typeof members)[number]>();
  members.forEach((member) => uniqueMembers.set(`${member.normalizedName}-${member.shift}`, member));

  return { members: Array.from(uniqueMembers.values()) };
};
