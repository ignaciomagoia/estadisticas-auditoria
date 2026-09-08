import { getAugust2026ShiftRoster } from '../config/august-2026-operator-shifts';
import { getJuly2026ShiftRoster } from '../config/july-2026-operator-shifts';
import { parseShiftRosterWorkbook } from '../data/shiftRosterParser';
import type { ShiftRoster } from '../domain/shift-types';
import type { DatasetMeta } from '../types/audit';

export const LEGACY_SHIFT_ROSTER_PATH = '/data/turnos/nomina-turnos.xlsx';

const isJuly2026 = (period: DatasetMeta | null) => period?.year === 2026 && period.month === 7;
const isAugust2026 = (period: DatasetMeta | null) => period?.year === 2026 && period.month === 8;

const loadLegacyShiftRoster = async (): Promise<ShiftRoster> => {
  const response = await fetch(LEGACY_SHIFT_ROSTER_PATH);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el archivo ${LEGACY_SHIFT_ROSTER_PATH}.`);
  }

  const buffer = await response.arrayBuffer();
  return parseShiftRosterWorkbook(buffer);
};

export const loadShiftRoster = async (period: DatasetMeta | null): Promise<ShiftRoster> => {
  if (isJuly2026(period)) return getJuly2026ShiftRoster();
  if (isAugust2026(period)) return getAugust2026ShiftRoster();
  return loadLegacyShiftRoster();
};
