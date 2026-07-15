import type { CountItem, FilterState, OperatorSummary } from '../types/audit';
import type { ShiftAuditRecord, ShiftCode, ShiftReasonComparisonItem, ShiftReasonItem, ShiftSummary } from './shift-types';
import { SHIFT_CODES } from './shift-types';
import { getKpiSummary, getOperatorSummaries, getReasonCounts, isNovelty, normalizeReasonLabel } from '../services/metricsService';

export interface ShiftFilterState {
  shift: string;
  auditor: string;
  affectedSystem: string;
  correctionReason: string;
}

export const EMPTY_SHIFT_FILTERS: ShiftFilterState = {
  shift: '',
  auditor: '',
  affectedSystem: '',
  correctionReason: '',
};

export const applyShiftFilters = (records: ShiftAuditRecord[], filters: ShiftFilterState) =>
  records.filter((record) => {
    if (filters.shift && record.shift !== filters.shift) return false;
    if (filters.auditor && record.auditor !== filters.auditor) return false;
    if (filters.affectedSystem && record.affectedSystem !== filters.affectedSystem) return false;
    if (filters.correctionReason && record.correctionReason !== filters.correctionReason) return false;
    return true;
  });

export const applyCompatibleOperatorFiltersForShifts = (records: ShiftAuditRecord[], filters: FilterState) =>
  records.filter((record) => {
    if (filters.auditor && record.auditor !== filters.auditor) return false;
    if (filters.affectedSystem && record.affectedSystem !== filters.affectedSystem) return false;
    if (filters.correctionReason && record.correctionReason !== filters.correctionReason) return false;
    return true;
  });

export const getShiftKpis = (records: ShiftAuditRecord[]) => {
  const summary = getKpiSummary(records);
  return {
    ...summary,
    shiftsWithAudits: new Set(records.map((record) => record.shift)).size,
    associatedOperators: new Set(records.map((record) => record.operator)).size,
  };
};

export const getShiftSummaries = (records: ShiftAuditRecord[]): ShiftSummary[] =>
  SHIFT_CODES.map((shift) => {
    const shiftRecords = records.filter((record) => record.shift === shift);
    const summary = getKpiSummary(shiftRecords);
    const topReason = getReasonCounts(shiftRecords)[0] ?? null;
    return {
      shift,
      operatorsCount: new Set(shiftRecords.map((record) => record.operator)).size,
      totalAudits: summary.totalAudits,
      validCount: summary.validCount,
      correctedCount: summary.correctedCount,
      observedCount: summary.observedCount,
      noveltyCount: summary.noveltyCount,
      validatedRate: summary.validatedRate,
      noveltyRate: summary.noveltyRate,
      topReason: topReason?.label ?? null,
    };
  })
    .filter((summary) => summary.totalAudits > 0)
    .sort((a, b) => a.validatedRate - b.validatedRate || b.noveltyCount - a.noveltyCount);

export const getShiftSummariesByNoveltyVolume = (records: ShiftAuditRecord[]) =>
  getShiftSummaries(records).sort((a, b) => b.noveltyCount - a.noveltyCount || a.shift.localeCompare(b.shift));

export const getShiftReasonCounts = (records: ShiftAuditRecord[], shift: ShiftCode): ShiftReasonItem[] => {
  const shiftRecords = records.filter((record) => record.shift === shift);
  const totalAudits = getKpiSummary(shiftRecords).totalAudits;
  const noveltyCount = shiftRecords.filter(isNovelty).length;

  return getReasonCounts(shiftRecords).map((reason) => ({
    label: reason.label,
    count: reason.count,
    percentOfAudits: totalAudits ? (reason.count / totalAudits) * 100 : 0,
    percentOfNovelties: noveltyCount ? (reason.count / noveltyCount) * 100 : 0,
    operatorsCount: new Set(shiftRecords.filter((record) => isNovelty(record) && normalizeReasonLabel(record.correctionReason) === reason.label).map((record) => record.operator)).size,
    isMissing: reason.isMissing,
  }));
};

export const getShiftReasons = (records: ShiftAuditRecord[]) => Array.from(new Set(getReasonCounts(records).map((reason) => reason.label))).sort((a, b) => a.localeCompare(b, 'es'));

export const getShiftsForReason = (records: ShiftAuditRecord[], reason: string): ShiftReasonComparisonItem[] =>
  SHIFT_CODES.map((shift) => {
    const shiftRecords = records.filter((record) => record.shift === shift);
    const summary = getKpiSummary(shiftRecords);
    const count = shiftRecords.filter((record) => isNovelty(record) && normalizeReasonLabel(record.correctionReason) === reason).length;
    return {
      shift,
      reason,
      count,
      totalAudits: summary.totalAudits,
      noveltyCount: summary.noveltyCount,
      percentOfAudits: summary.totalAudits ? (count / summary.totalAudits) * 100 : 0,
      percentOfNovelties: summary.noveltyCount ? (count / summary.noveltyCount) * 100 : 0,
    };
  })
    .filter((item) => item.totalAudits > 0)
    .sort((a, b) => b.count - a.count || a.shift.localeCompare(b.shift));

export const getShiftOperatorSummaries = (records: ShiftAuditRecord[], shift: ShiftCode): OperatorSummary[] =>
  getOperatorSummaries(records.filter((record) => record.shift === shift));

export const toCountItems = (summaries: ShiftSummary[], selector: (summary: ShiftSummary) => number): CountItem[] =>
  summaries.map((summary) => ({ label: `Turno ${summary.shift}`, count: selector(summary) }));
