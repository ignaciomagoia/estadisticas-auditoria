import { parseShiftRosterWorkbook } from '../data/shiftRosterParser';
import type { ShiftRoster } from '../domain/shift-types';

export const SHIFT_ROSTER_PATH = '/data/turnos/nomina-turnos.xlsx';

export const loadShiftRoster = async (): Promise<ShiftRoster> => {
  const response = await fetch(SHIFT_ROSTER_PATH);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el archivo ${SHIFT_ROSTER_PATH}.`);
  }

  const buffer = await response.arrayBuffer();
  return parseShiftRosterWorkbook(buffer);
};
