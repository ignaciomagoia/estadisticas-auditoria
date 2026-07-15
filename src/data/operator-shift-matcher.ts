import { OPERATOR_NAME_ALIASES } from '../config/operator-name-aliases';
import type { AuditRecord } from '../types/audit';
import type { OperatorShiftMatchReport, ShiftAuditRecord, ShiftMember, ShiftOperatorMatch, UnmatchedShiftOperator } from '../domain/shift-types';
import { areShortNameTokensContained, normalizePersonName } from '../utils/normalize-person-name';

const getOperatorAuditCounts = (records: AuditRecord[]) => {
  const counter = new Map<string, number>();
  records.forEach((record) => counter.set(record.operator, (counter.get(record.operator) ?? 0) + 1));
  return counter;
};

const uniqueOperators = (records: AuditRecord[]) => Array.from(getOperatorAuditCounts(records).keys()).sort((a, b) => a.localeCompare(b, 'es'));

const createMatch = (
  operatorName: string,
  normalizedOperatorName: string,
  member: ShiftMember,
  matchLevel: ShiftOperatorMatch['matchLevel'],
): ShiftOperatorMatch => ({
  operatorName,
  normalizedOperatorName,
  normalizedRosterName: member.normalizedName,
  member,
  shift: member.shift,
  matchLevel,
});

const findUniqueByNormalizedName = (normalizedName: string, members: ShiftMember[]) => members.filter((member) => member.normalizedName === normalizedName);

const findContainedCandidates = (operatorName: string, members: ShiftMember[]) =>
  members.filter((member) => areShortNameTokensContained(operatorName, member.originalName) || areShortNameTokensContained(member.originalName, operatorName));

export const matchOperatorsToShifts = (records: AuditRecord[], members: ShiftMember[]): OperatorShiftMatchReport => {
  const auditCounts = getOperatorAuditCounts(records);
  const operators = uniqueOperators(records);
  const matches: ShiftOperatorMatch[] = [];
  const ambiguousMatches: OperatorShiftMatchReport['ambiguousMatches'] = [];
  const unmatchedOperators: UnmatchedShiftOperator[] = [];

  operators.forEach((operatorName) => {
    const normalizedOperatorName = normalizePersonName(operatorName);
    const aliasTarget = OPERATOR_NAME_ALIASES[normalizedOperatorName];

    if (aliasTarget) {
      const aliasCandidates = findUniqueByNormalizedName(aliasTarget, members);
      if (aliasCandidates.length === 1) {
        matches.push(createMatch(operatorName, normalizedOperatorName, aliasCandidates[0], 'aliasMatch'));
        return;
      }
      if (aliasCandidates.length > 1) {
        ambiguousMatches.push({
          operatorName,
          normalizedOperatorName,
          candidates: aliasCandidates,
          reason: 'Alias manual resuelve a mas de una persona de la nomina.',
        });
        return;
      }
    }

    const exactCandidates = findUniqueByNormalizedName(normalizedOperatorName, members);
    if (exactCandidates.length === 1) {
      matches.push(createMatch(operatorName, normalizedOperatorName, exactCandidates[0], 'exactMatch'));
      return;
    }
    if (exactCandidates.length > 1) {
      ambiguousMatches.push({
        operatorName,
        normalizedOperatorName,
        candidates: exactCandidates,
        reason: 'Coincidencia exacta normalizada con mas de una persona.',
      });
      return;
    }

    const containedCandidates = findContainedCandidates(operatorName, members);
    if (containedCandidates.length === 1) {
      matches.push(createMatch(operatorName, normalizedOperatorName, containedCandidates[0], 'containedWordsMatch'));
      return;
    }
    if (containedCandidates.length > 1) {
      ambiguousMatches.push({
        operatorName,
        normalizedOperatorName,
        candidates: containedCandidates,
        reason: 'El nombre corto aparece contenido en mas de una persona posible.',
      });
      return;
    }

    unmatchedOperators.push({
      operatorName,
      normalizedOperatorName,
      auditCount: auditCounts.get(operatorName) ?? 0,
      reason: aliasTarget ? 'Alias manual sin candidato en nomina.' : 'Sin coincidencia exacta ni por palabras contenidas.',
    });
  });

  const matchedRosterNames = new Set(matches.map((match) => `${match.member.normalizedName}-${match.member.shift}`));
  const rosterMembersWithoutAudits = members.filter((member) => !matchedRosterNames.has(`${member.normalizedName}-${member.shift}`));
  const associatedOperators = new Set(matches.map((match) => match.operatorName));
  const associatedAuditCount = records.filter((record) => associatedOperators.has(record.operator)).length;
  const excludedAuditCount = records.length - associatedAuditCount;
  const excludedAuditRanking = unmatchedOperators
    .map(({ operatorName, auditCount }) => ({ operatorName, auditCount }))
    .sort((a, b) => b.auditCount - a.auditCount || a.operatorName.localeCompare(b.operatorName, 'es'));

  return {
    matches,
    unmatchedOperators,
    ambiguousMatches,
    rosterMembersWithoutAudits,
    totalAuditOperators: operators.length,
    totalRosterMembers: members.length,
    exactMatchCount: matches.filter((match) => match.matchLevel === 'exactMatch').length,
    containedWordsMatchCount: matches.filter((match) => match.matchLevel === 'containedWordsMatch').length,
    aliasMatchCount: matches.filter((match) => match.matchLevel === 'aliasMatch').length,
    associatedAuditCount,
    excludedAuditCount,
    excludedAuditRanking,
  };
};

export const attachShiftsToAuditRecords = (records: AuditRecord[], report: OperatorShiftMatchReport): ShiftAuditRecord[] => {
  const matchByOperator = new Map(report.matches.map((match) => [match.operatorName, match]));
  return records.flatMap((record) => {
    const match = matchByOperator.get(record.operator);
    if (!match) return [];
    return [{ ...record, shift: match.shift, matchedRosterName: match.member.originalName }];
  });
};
