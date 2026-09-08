import { getAugust2026ShiftMembers } from '../config/august-2026-operator-shifts';
import { getJuly2026ShiftMembers } from '../config/july-2026-operator-shifts';
import { OPERATOR_NAME_ALIASES } from '../config/operator-name-aliases';
import type { ShiftMember } from '../domain/shift-types';
import type { AuditDataset, AuditRecord, DatasetMeta } from '../types/audit';
import { areShortNameTokensContained, normalizePersonName } from '../utils/normalize-person-name';

const isJuly2026 = (meta: DatasetMeta | null) => meta?.year === 2026 && meta.month === 7;
const isAugust2026 = (meta: DatasetMeta | null) => meta?.year === 2026 && meta.month === 8;

const toDisplayNameFromNormalizedKey = (normalizedName: string) =>
  normalizedName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('es-AR') + part.slice(1))
    .join(' ');

const getPeriodMembers = (meta: DatasetMeta | null) => {
  if (isJuly2026(meta)) return getJuly2026ShiftMembers();
  if (isAugust2026(meta)) return getAugust2026ShiftMembers();
  return [];
};

const findUniqueByNormalizedName = (normalizedName: string, members: ShiftMember[]) => {
  const candidates = members.filter((member) => member.normalizedName === normalizedName);
  return candidates.length === 1 ? candidates[0] : null;
};

const findUniqueContainedMatch = (operatorName: string, members: ShiftMember[]) => {
  const candidates = members.filter(
    (member) => areShortNameTokensContained(operatorName, member.originalName) || areShortNameTokensContained(member.originalName, operatorName),
  );
  return candidates.length === 1 ? candidates[0] : null;
};

export const getCanonicalOperatorName = (operatorName: string, meta: DatasetMeta | null) => {
  const cleanedOperatorName = operatorName.trim().replace(/\s+/g, ' ');
  const normalizedOperatorName = normalizePersonName(cleanedOperatorName);
  const members = getPeriodMembers(meta);
  const aliasTarget = OPERATOR_NAME_ALIASES[normalizedOperatorName];

  if (aliasTarget) {
    const aliasCandidate = findUniqueByNormalizedName(aliasTarget, members);
    if (aliasCandidate) return aliasCandidate.originalName;
  }

  return (
    findUniqueByNormalizedName(normalizedOperatorName, members)?.originalName ??
    findUniqueContainedMatch(cleanedOperatorName, members)?.originalName ??
    (aliasTarget ? toDisplayNameFromNormalizedKey(aliasTarget) : cleanedOperatorName)
  );
};

export const canonicalizeAuditRecords = (records: AuditRecord[], meta: DatasetMeta | null) =>
  records.map((record) => {
    const canonicalOperator = getCanonicalOperatorName(record.operator, meta);
    return canonicalOperator === record.operator ? record : { ...record, operator: canonicalOperator };
  });

export const canonicalizeAuditDatasetOperators = (dataset: AuditDataset): AuditDataset => ({
  ...dataset,
  records: canonicalizeAuditRecords(dataset.records, dataset.meta),
});
