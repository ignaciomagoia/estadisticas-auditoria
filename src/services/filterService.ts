import type { AuditRecord, FilterState } from '../types/audit';

export const EMPTY_FILTERS: FilterState = {
  operator: '',
  auditor: '',
  action: '',
  affectedSystem: '',
  correctionReason: '',
};

export const applyAuditFilters = (records: AuditRecord[], filters: FilterState) =>
  records.filter((record) => {
    if (filters.operator && record.operator !== filters.operator) return false;
    if (filters.auditor && record.auditor !== filters.auditor) return false;
    if (filters.action && record.action !== filters.action) return false;
    if (filters.affectedSystem && record.affectedSystem !== filters.affectedSystem) return false;
    if (filters.correctionReason && record.correctionReason !== filters.correctionReason) return false;
    return true;
  });

// Percentage rankings compare Validado/Corregido/Observado, so they intentionally
// ignore only the action filter while preserving the rest of the user's context.
export const applyAuditFiltersWithoutAction = (records: AuditRecord[], filters: FilterState) =>
  applyAuditFilters(records, { ...filters, action: '' });
