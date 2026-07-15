export type AuditAction = 'Validado' | 'Corregido' | 'Observado';
export type ParsedAuditAction = AuditAction | 'Accion desconocida';

export interface AuditRecord {
  date: Date;
  auditor: string;
  eventId: string;
  sourceMedium: string | null;
  operator: string;
  delaySae: number | null;
  action: ParsedAuditAction;
  affectedSystem: string | null;
  correctionReason: string | null;
  additionalNotes: string | null;
}

export interface DatasetMeta {
  id: string;
  monthLabel: string;
  sourcePath: string;
  lastUpdated: Date | null;
  fileName?: string;
  year?: number;
  month?: number;
}

export interface AuditDataset {
  meta: DatasetMeta;
  records: AuditRecord[];
}

export interface FilterState {
  operator: string;
  auditor: string;
  action: string;
  affectedSystem: string;
  correctionReason: string;
}

export interface OperatorShift {
  operatorName: string;
  shift: string;
}

export interface KpiSummary {
  totalAudits: number;
  totalOperators: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  noveltyCount: number;
  noveltyRate: number;
  validatedRate: number;
  averageDelay: number | null;
  unknownActionCount: number;
}

export interface OperatorSummary {
  operator: string;
  totalAudits: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  noveltyCount: number;
  noveltyRate: number;
  validatedRate: number;
  averageDelay: number | null;
  topReason: string | null;
  topReasonCount: number;
  topReasonConcentrationRate: number;
  topSystem: string | null;
  unknownActionCount: number;
  reasonCount: number;
  missingReasonCount: number;
  additionalNotesCount: number;
}

export interface OperatorNoveltyRate {
  operator: string;
  totalAudits: number;
  noveltyCount: number;
  noveltyRate: number;
}

export interface CountItem {
  label: string;
  count: number;
}

export interface OperatorReasonItem extends CountItem {
  key: string;
  isMissing: boolean;
  percentOfAudits: number;
  percentOfNovelties: number;
}

export interface OperatorMotivesSummary {
  operator: string;
  totalAudits: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  noveltyCount: number;
  validatedRate: number;
  noveltyRate: number;
  reasonCount: number;
  missingReasonCount: number;
  additionalNotesCount: number;
  additionalNotesRate: number;
  latestAdditionalNotes: AuditRecord[];
  reasons: OperatorReasonItem[];
}

export interface GeneralReasonItem extends OperatorReasonItem {
  affectedOperators: number;
  percentOfNovelties: number;
}

export interface OperatorReasonRankingItem {
  operator: string;
  totalAudits: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  noveltyCount: number;
  reasonCount: number;
  validatedRate: number;
  noveltyRate: number;
  reasons: OperatorReasonItem[];
}

export interface ReasonOperatorItem {
  operator: string;
  reason: string;
  count: number;
  totalAudits: number;
  noveltyCount: number;
  percentOfAudits: number;
  percentOfNovelties: number;
}
