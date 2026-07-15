import type { DatasetMeta } from '../types/audit';

const AUDIT_PERIOD_INDEX_PATH = '/data/auditorias/index.json';
const AUDIT_PERIOD_BASE_PATH = '/data/auditorias';

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase('es-AR') + value.slice(1).toLocaleLowerCase('es-AR');

export interface AuditPeriodIndex {
  months: string[];
}

export const parseAuditPeriodFileName = (fileName: string): DatasetMeta => {
  const match = fileName.match(/^([a-záéíóúñ]+)-(\d{4})\.xlsx$/i);
  if (!match) {
    throw new Error(`El archivo ${fileName} no respeta el formato esperado mes-aaaa.xlsx.`);
  }

  const monthName = match[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR');
  const month = MONTHS[monthName];
  const year = Number(match[2]);

  if (!month || !year) {
    throw new Error(`No se pudo detectar el periodo del archivo ${fileName}.`);
  }

  return {
    id: `${year}-${String(month).padStart(2, '0')}`,
    monthLabel: `${capitalize(monthName)} ${year}`,
    sourcePath: `${AUDIT_PERIOD_BASE_PATH}/${fileName}`,
    lastUpdated: null,
    fileName,
    year,
    month,
  };
};

export const loadAuditPeriods = async (): Promise<DatasetMeta[]> => {
  const response = await fetch(AUDIT_PERIOD_INDEX_PATH);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${AUDIT_PERIOD_INDEX_PATH}.`);
  }

  const index = (await response.json()) as AuditPeriodIndex;
  if (!Array.isArray(index.months) || index.months.length === 0) {
    throw new Error('El archivo index.json no contiene periodos de auditorias.');
  }

  return index.months
    .map(parseAuditPeriodFileName)
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || (a.month ?? 0) - (b.month ?? 0));
};
