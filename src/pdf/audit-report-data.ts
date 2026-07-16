import {
  getGeneralReasonStats,
  getLowestValidationOperators,
  getOperatorsByNoveltyVolume,
  getOperatorsForReason,
  getReasonCounts,
} from '../services/metricsService';
import {
  getShiftReasonCounts,
  getShiftSummariesByNoveltyVolume,
  getShiftsForReason,
} from '../domain/shift-metrics';
import type { AuditRecord, KpiSummary, OperatorSummary } from '../types/audit';
import type { ShiftAuditRecord, ShiftCode, ShiftSummary } from '../domain/shift-types';
import type { AuditReportKpis, AuditReportPayload } from './audit-report-types';
import { formatNumber, formatPercent } from '../utils/formatters';

const REPORT_OPERATOR_ROWS = 20;
const REPORT_SHIFT_ROWS = 15;

const toReportKpis = (summary: KpiSummary, dimensionLabel: string, dimensionValue: number): AuditReportKpis => ({
  totalAudits: summary.totalAudits,
  validatedRate: summary.validatedRate,
  noveltyRate: summary.noveltyRate,
  validCount: summary.validCount,
  correctedCount: summary.correctedCount,
  observedCount: summary.observedCount,
  dimensionLabel,
  dimensionValue,
});

const getObjectiveSummaryLines = (kpis: AuditReportKpis, topReason: string | null) => [
  `El ${formatPercent(kpis.validatedRate)} de las auditorias resulto validado.`,
  `Se registraron ${formatNumber(kpis.correctedCount)} casos corregidos y ${formatNumber(kpis.observedCount)} observados.`,
  topReason ? `El motivo de correccion mas frecuente fue ${topReason}.` : 'No se registraron motivos de correccion en el conjunto filtrado.',
  `El informe incluye ${formatNumber(kpis.dimensionValue)} ${kpis.dimensionLabel.toLocaleLowerCase('es-AR')}.`,
];

const getOperatorTableRows = (summaries: OperatorSummary[], minimumAudits: number) =>
  [...summaries]
    .sort((a, b) => {
      const sampleResult = Number(b.totalAudits >= minimumAudits) - Number(a.totalAudits >= minimumAudits);
      return sampleResult || a.validatedRate - b.validatedRate || b.noveltyCount - a.noveltyCount || a.operator.localeCompare(b.operator, 'es');
    })
    .slice(0, REPORT_OPERATOR_ROWS);

export const buildOperatorAuditReportPayload = ({
  periodLabel,
  filtersSummary,
  kpis,
  records,
  summaries,
  rankingSummaries,
  minimumAudits,
}: {
  periodLabel: string;
  filtersSummary: string[];
  kpis: KpiSummary;
  records: AuditRecord[];
  summaries: OperatorSummary[];
  rankingSummaries: OperatorSummary[];
  minimumAudits: number;
}): AuditReportPayload => {
  const topReasons = getGeneralReasonStats(records, 10);
  const selectedReason = topReasons[0]?.label ?? null;
  const reportKpis = toReportKpis(kpis, 'Operadores auditados', kpis.totalOperators);

  return {
    periodLabel,
    viewMode: 'operators',
    viewLabel: 'Operadores',
    filtersSummary,
    kpis: reportKpis,
    summaryLines: getObjectiveSummaryLines(reportKpis, selectedReason),
    operatorPages: {
      minimumAudits,
      kpis,
      lowestValidation: getLowestValidationOperators(rankingSummaries, minimumAudits, 10),
      noveltyVolume: getOperatorsByNoveltyVolume(summaries, 10),
      topReasons,
      selectedReason,
      operatorsForReason: selectedReason ? getOperatorsForReason(selectedReason, records, summaries).slice(0, 10) : [],
      tableRows: getOperatorTableRows(summaries, minimumAudits),
    },
  };
};

export const buildShiftAuditReportPayload = ({
  periodLabel,
  filtersSummary,
  kpis,
  records,
  summaries,
}: {
  periodLabel: string;
  filtersSummary: string[];
  kpis: KpiSummary & { shiftsWithAudits: number };
  records: ShiftAuditRecord[];
  summaries: ShiftSummary[];
}): AuditReportPayload => {
  const selectedShift = summaries[0]?.shift ?? null;
  const topReason = getReasonCounts(records)[0]?.label ?? null;
  const reportKpis = toReportKpis(kpis, 'Turnos con auditorias', kpis.shiftsWithAudits);

  return {
    periodLabel,
    viewMode: 'shifts',
    viewLabel: 'Turnos',
    filtersSummary,
    kpis: reportKpis,
    summaryLines: getObjectiveSummaryLines(reportKpis, topReason),
    shiftPages: {
      validationByShift: summaries.slice(0, 10),
      noveltyVolumeByShift: getShiftSummariesByNoveltyVolume(records).slice(0, 10),
      selectedShift,
      reasonsBySelectedShift: selectedShift ? getShiftReasonCounts(records, selectedShift as ShiftCode).slice(0, 10) : [],
      selectedReason: topReason,
      shiftsForReason: topReason ? getShiftsForReason(records, topReason).slice(0, 10) : [],
      tableRows: summaries.slice(0, REPORT_SHIFT_ROWS),
    },
  };
};
