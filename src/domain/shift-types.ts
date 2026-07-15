import type { AuditRecord } from '../types/audit';

export type ShiftCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const SHIFT_CODES: ShiftCode[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface ShiftMember {
  originalName: string;
  normalizedName: string;
  shift: ShiftCode;
}

export interface ShiftRoster {
  members: ShiftMember[];
}

export interface ShiftOperatorMatch {
  operatorName: string;
  normalizedOperatorName: string;
  normalizedRosterName: string;
  member: ShiftMember;
  shift: ShiftCode;
  matchLevel: 'aliasMatch' | 'exactMatch' | 'containedWordsMatch';
}

export interface AmbiguousShiftMatch {
  operatorName: string;
  normalizedOperatorName: string;
  candidates: ShiftMember[];
  reason: string;
}

export interface UnmatchedShiftOperator {
  operatorName: string;
  normalizedOperatorName: string;
  auditCount: number;
  reason: string;
}

export interface ExcludedAuditRankingItem {
  operatorName: string;
  auditCount: number;
}

export interface OperatorShiftMatchReport {
  matches: ShiftOperatorMatch[];
  unmatchedOperators: UnmatchedShiftOperator[];
  ambiguousMatches: AmbiguousShiftMatch[];
  rosterMembersWithoutAudits: ShiftMember[];
  totalAuditOperators: number;
  totalRosterMembers: number;
  exactMatchCount: number;
  containedWordsMatchCount: number;
  aliasMatchCount: number;
  associatedAuditCount: number;
  excludedAuditCount: number;
  excludedAuditRanking: ExcludedAuditRankingItem[];
}

export interface ShiftAuditRecord extends AuditRecord {
  shift: ShiftCode;
  matchedRosterName: string;
}

export interface ShiftSummary {
  shift: ShiftCode;
  operatorsCount: number;
  totalAudits: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  noveltyCount: number;
  validatedRate: number;
  noveltyRate: number;
  topReason: string | null;
}

export interface ShiftReasonItem {
  label: string;
  count: number;
  percentOfAudits: number;
  percentOfNovelties: number;
  operatorsCount: number;
  isMissing: boolean;
}

export interface ShiftReasonComparisonItem {
  shift: ShiftCode;
  reason: string;
  count: number;
  totalAudits: number;
  noveltyCount: number;
  percentOfAudits: number;
  percentOfNovelties: number;
}
