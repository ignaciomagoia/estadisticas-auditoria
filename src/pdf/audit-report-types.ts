import type {
  GeneralReasonItem,
  KpiSummary,
  OperatorSummary,
  ReasonOperatorItem,
} from '../types/audit';
import type { ShiftCode, ShiftReasonComparisonItem, ShiftReasonItem, ShiftSummary } from '../domain/shift-types';

export type AuditReportViewMode = 'operators' | 'shifts';
export type AuditReportScope = 'executive' | 'detailed';

export interface AuditReportBase {
  periodLabel: string;
  viewMode: AuditReportViewMode;
  viewLabel: string;
  reportScope: AuditReportScope;
  filtersSummary: string[];
  generatedAt: Date;
}

export type AuditReportPayload = Omit<AuditReportBase, 'generatedAt'> & {
  kpis: AuditReportKpis;
  summaryLines: string[];
  operatorPages?: AuditReportOperatorPages;
  shiftPages?: AuditReportShiftPages;
};

export interface AuditReportData extends AuditReportPayload {
  generatedAt: Date;
}

export interface AuditReportKpis {
  totalAudits: number;
  validatedRate: number;
  noveltyRate: number;
  validCount: number;
  correctedCount: number;
  observedCount: number;
  dimensionLabel: string;
  dimensionValue: number;
}

export interface AuditReportOperatorPages {
  minimumAudits: number;
  kpis: KpiSummary;
  lowestValidation: OperatorSummary[];
  noveltyVolume: OperatorSummary[];
  topReasons: GeneralReasonItem[];
  selectedReason: string | null;
  operatorsForReason: ReasonOperatorItem[];
  tableRows: OperatorSummary[];
}

export interface AuditReportShiftPages {
  validationByShift: ShiftSummary[];
  noveltyVolumeByShift: ShiftSummary[];
  selectedShift: string | null;
  reasonsBySelectedShift: ShiftReasonItem[];
  selectedReason: string | null;
  shiftsForReason: ShiftReasonComparisonItem[];
  tableRows: ShiftSummary[];
  operatorTablesByShift: ShiftOperatorTable[];
}

export interface ShiftOperatorTable {
  shift: ShiftCode;
  rows: OperatorSummary[];
}

export interface ReportTableColumn<T> {
  key: keyof T | string;
  label: string;
  width: number;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => string;
}
