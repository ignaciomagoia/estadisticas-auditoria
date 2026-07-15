import type {
  AuditRecord,
  CountItem,
  KpiSummary,
  GeneralReasonItem,
  OperatorMotivesSummary,
  OperatorNoveltyRate,
  OperatorReasonItem,
  OperatorReasonRankingItem,
  OperatorSummary,
  ReasonOperatorItem,
} from '../types/audit';
import { topEntries } from '../utils/arrays';

const KNOWN_ACTIONS = ['Validado', 'Corregido', 'Observado'] as const;
export const MISSING_REASON_LABEL = 'Sin motivo informado';

export const isKnownAction = (record: AuditRecord) => KNOWN_ACTIONS.includes(record.action as (typeof KNOWN_ACTIONS)[number]);
export const isNovelty = (record: AuditRecord) => record.action === 'Corregido' || record.action === 'Observado';

const average = (values: number[]) => {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const calculateValidatedRate = (validCount: number, totalAudits: number) => (totalAudits ? (validCount / totalAudits) * 100 : 0);
export const calculateNoveltyRate = (noveltyCount: number, totalAudits: number) => (totalAudits ? (noveltyCount / totalAudits) * 100 : 0);

const countBy = (records: AuditRecord[], selector: (record: AuditRecord) => string | null): CountItem[] => {
  const counter = new Map<string, number>();
  records.forEach((record) => {
    const value = selector(record);
    if (value) counter.set(value, (counter.get(value) ?? 0) + 1);
  });
  return topEntries(counter);
};

export const normalizeReasonKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-AR')
    .replace(/\s+/g, ' ');

export const normalizeReasonLabel = (value: string | null) => {
  if (!value) return MISSING_REASON_LABEL;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned || MISSING_REASON_LABEL;
};

export const hasAdditionalNote = (record: AuditRecord) => Boolean(record.additionalNotes?.trim());

export const getAdditionalNotesSummary = (records: AuditRecord[]) => {
  const noveltyRecords = records.filter(isNovelty);
  const recordsWithNotes = noveltyRecords.filter(hasAdditionalNote).sort((a, b) => b.date.getTime() - a.date.getTime());
  return {
    count: recordsWithNotes.length,
    rate: noveltyRecords.length ? (recordsWithNotes.length / noveltyRecords.length) * 100 : 0,
    latest: recordsWithNotes.slice(0, 5),
  };
};

export const getReasonCounts = (records: AuditRecord[]): OperatorReasonItem[] => {
  const reasonMap = new Map<string, OperatorReasonItem>();
  const totalAudits = records.filter(isKnownAction).length;
  const noveltyCount = records.filter(isNovelty).length;

  records.filter(isNovelty).forEach((record) => {
    const label = normalizeReasonLabel(record.correctionReason);
    const key = label === MISSING_REASON_LABEL ? '__missing_reason__' : normalizeReasonKey(label);
    const current = reasonMap.get(key);
    reasonMap.set(key, {
      key,
      label: current?.label ?? label,
      count: (current?.count ?? 0) + 1,
      isMissing: label === MISSING_REASON_LABEL,
      percentOfAudits: 0,
      percentOfNovelties: 0,
    });
  });

  return Array.from(reasonMap.values())
    .map((reason) => ({
      ...reason,
      percentOfAudits: totalAudits ? (reason.count / totalAudits) * 100 : 0,
      percentOfNovelties: noveltyCount ? (reason.count / noveltyCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
};

export const getTopReason = (records: AuditRecord[]) => getReasonCounts(records)[0] ?? null;

export const calculateTopReasonConcentration = (topReasonCount: number, noveltyCount: number) =>
  noveltyCount ? (topReasonCount / noveltyCount) * 100 : 0;

export const getKpiSummary = (records: AuditRecord[]): KpiSummary => {
  const knownRecords = records.filter(isKnownAction);
  const totalAudits = knownRecords.length;
  const validCount = knownRecords.filter((record) => record.action === 'Validado').length;
  const correctedCount = knownRecords.filter((record) => record.action === 'Corregido').length;
  const observedCount = knownRecords.filter((record) => record.action === 'Observado').length;
  const noveltyCount = correctedCount + observedCount;

  return {
    totalAudits,
    totalOperators: new Set(knownRecords.map((record) => record.operator)).size,
    validCount,
    correctedCount,
    observedCount,
    noveltyCount,
    noveltyRate: calculateNoveltyRate(noveltyCount, totalAudits),
    validatedRate: calculateValidatedRate(validCount, totalAudits),
    averageDelay: average(knownRecords.map((record) => record.delaySae).filter((value): value is number => value !== null)),
    unknownActionCount: records.length - knownRecords.length,
  };
};

export const getActionDistribution = (records: AuditRecord[]) =>
  [...KNOWN_ACTIONS].map((action) => ({
    label: action,
    count: records.filter((record) => record.action === action).length,
  }));

export const getTopCorrectionReasons = (records: AuditRecord[], limit = 10) => getReasonCounts(records).slice(0, limit);

export const getGeneralReasonStats = (records: AuditRecord[], limit = 10): GeneralReasonItem[] => {
  const noveltyRecords = records.filter(isNovelty);
  const totalNovelty = noveltyRecords.length;
  const stats = new Map<string, GeneralReasonItem & { operators: Set<string> }>();

  noveltyRecords.forEach((record) => {
    const label = normalizeReasonLabel(record.correctionReason);
    const key = label === MISSING_REASON_LABEL ? '__missing_reason__' : normalizeReasonKey(label);
    const current = stats.get(key);
    const operators = current?.operators ?? new Set<string>();
    operators.add(record.operator);
    stats.set(key, {
      key,
      label: current?.label ?? label,
      count: (current?.count ?? 0) + 1,
      isMissing: label === MISSING_REASON_LABEL,
      affectedOperators: operators.size,
      percentOfAudits: 0,
      percentOfNovelties: 0,
      operators,
    });
  });

  return Array.from(stats.values())
    .map(({ operators, ...reason }) => ({
      ...reason,
      affectedOperators: operators.size,
      percentOfNovelties: totalNovelty ? (reason.count / totalNovelty) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'))
    .slice(0, limit);
};

export const getMissingReasonCount = (records: AuditRecord[]) => records.filter((record) => isNovelty(record) && !record.correctionReason?.trim()).length;

export const getReasonVariantWarnings = (records: AuditRecord[]) => {
  const variants = new Map<string, Set<string>>();
  records.filter(isNovelty).forEach((record) => {
    if (!record.correctionReason?.trim()) return;
    const label = normalizeReasonLabel(record.correctionReason);
    const key = normalizeReasonKey(label);
    variants.set(key, (variants.get(key) ?? new Set<string>()).add(label));
  });

  return Array.from(variants.values())
    .map((labels) => Array.from(labels))
    .filter((labels) => labels.length > 1);
};

export const getAuditCountByOperator = (records: AuditRecord[]) => countBy(records.filter(isKnownAction), (record) => record.operator);

export const getAverageDelayByOperator = (records: AuditRecord[]) => {
  const groups = new Map<string, number[]>();
  records.filter(isKnownAction).forEach((record) => {
    if (record.delaySae === null) return;
    groups.set(record.operator, [...(groups.get(record.operator) ?? []), record.delaySae]);
  });

  return Array.from(groups.entries())
    .map(([label, values]) => ({ label, count: Number(average(values)?.toFixed(1) ?? 0) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
};

export const getOperatorSummaries = (records: AuditRecord[]): OperatorSummary[] => {
  const groups = new Map<string, AuditRecord[]>();
  records.forEach((record) => groups.set(record.operator, [...(groups.get(record.operator) ?? []), record]));

  return Array.from(groups.entries())
    .map(([operator, operatorRecords]) => {
      const summary = getKpiSummary(operatorRecords);
      const topReason = getTopReason(operatorRecords);
      const missingReasonCount = getReasonCounts(operatorRecords).find((reason) => reason.isMissing)?.count ?? 0;
      const notesSummary = getAdditionalNotesSummary(operatorRecords);
      return {
        operator,
        totalAudits: summary.totalAudits,
        validCount: summary.validCount,
        correctedCount: summary.correctedCount,
        observedCount: summary.observedCount,
        noveltyCount: summary.noveltyCount,
        noveltyRate: summary.noveltyRate,
        validatedRate: summary.validatedRate,
        averageDelay: summary.averageDelay,
        topReason: topReason?.label ?? null,
        topReasonCount: topReason?.count ?? 0,
        topReasonConcentrationRate: calculateTopReasonConcentration(topReason?.count ?? 0, summary.noveltyCount),
        topSystem: countBy(operatorRecords.filter(isKnownAction), (record) => record.affectedSystem)[0]?.label ?? null,
        unknownActionCount: summary.unknownActionCount,
        reasonCount: getReasonCounts(operatorRecords).reduce((sum, reason) => sum + reason.count, 0),
        missingReasonCount,
        additionalNotesCount: notesSummary.count,
      };
    })
    .sort((a, b) => a.validatedRate - b.validatedRate || b.noveltyCount - a.noveltyCount || a.operator.localeCompare(b.operator, 'es'));
};

export const applyMinimumAudits = <T extends { totalAudits: number }>(items: T[], minimumAudits: number) =>
  items.filter((item) => item.totalAudits >= minimumAudits);

export const getLowestValidationOperators = (summaries: OperatorSummary[], minimumAudits = 10, limit = 15) =>
  applyMinimumAudits(summaries, minimumAudits)
    .sort((a, b) => a.validatedRate - b.validatedRate || b.noveltyCount - a.noveltyCount || a.operator.localeCompare(b.operator, 'es'))
    .slice(0, limit);

export const getOperatorsByNoveltyVolume = (summaries: OperatorSummary[], limit = 15) =>
  summaries
    .filter((summary) => summary.noveltyCount > 0)
    .sort((a, b) => b.noveltyCount - a.noveltyCount || b.noveltyRate - a.noveltyRate || a.operator.localeCompare(b.operator, 'es'))
    .slice(0, limit);

export const getOperatorNoveltyRates = (records: AuditRecord[], minimumAudits = 10): OperatorNoveltyRate[] =>
  getOperatorSummaries(records)
    .filter((summary) => summary.totalAudits >= minimumAudits)
    .map((summary) => ({
      operator: summary.operator,
      totalAudits: summary.totalAudits,
      noveltyCount: summary.noveltyCount,
      noveltyRate: summary.noveltyRate,
    }))
    .sort((a, b) => b.noveltyRate - a.noveltyRate || b.noveltyCount - a.noveltyCount);

export const getOperatorMotivesSummary = (operator: string, records: AuditRecord[]): OperatorMotivesSummary | null => {
  const operatorRecords = records.filter((record) => record.operator === operator);
  if (operatorRecords.length === 0) return null;
  const summary = getKpiSummary(operatorRecords);
  const reasons = getReasonCounts(operatorRecords);
  const notesSummary = getAdditionalNotesSummary(operatorRecords);

  return {
    operator,
    totalAudits: summary.totalAudits,
    validCount: summary.validCount,
    correctedCount: summary.correctedCount,
    observedCount: summary.observedCount,
    noveltyCount: summary.noveltyCount,
    validatedRate: summary.validatedRate,
    noveltyRate: summary.noveltyRate,
    reasonCount: reasons.reduce((sum, reason) => sum + reason.count, 0),
    missingReasonCount: reasons.find((reason) => reason.isMissing)?.count ?? 0,
    additionalNotesCount: notesSummary.count,
    additionalNotesRate: notesSummary.rate,
    latestAdditionalNotes: notesSummary.latest,
    reasons,
  };
};

export const getOperatorReasonRankings = (summaries: OperatorSummary[], records: AuditRecord[], limit = 10): OperatorReasonRankingItem[] =>
  summaries
    .map((summary) => ({
      ...summary,
      reasonCount: getReasonCounts(records.filter((record) => record.operator === summary.operator)).reduce((sum, reason) => sum + reason.count, 0),
      reasons: getReasonCounts(records.filter((record) => record.operator === summary.operator)),
    }))
    .filter((summary) => summary.reasonCount > 0)
    .sort((a, b) => b.reasonCount - a.reasonCount || a.operator.localeCompare(b.operator, 'es'))
    .slice(0, limit);

export const getAllReasons = (records: AuditRecord[]) => getReasonCounts(records).map((reason) => reason.label);

export const getOperatorsForReason = (reasonLabel: string, records: AuditRecord[], summaries: OperatorSummary[]): ReasonOperatorItem[] => {
  const reasonKey = reasonLabel === MISSING_REASON_LABEL ? '__missing_reason__' : normalizeReasonKey(reasonLabel);
  const summaryByOperator = new Map(summaries.map((summary) => [summary.operator, summary]));
  const counter = new Map<string, number>();

  records.filter(isNovelty).forEach((record) => {
    const label = normalizeReasonLabel(record.correctionReason);
    const key = label === MISSING_REASON_LABEL ? '__missing_reason__' : normalizeReasonKey(label);
    if (key === reasonKey) counter.set(record.operator, (counter.get(record.operator) ?? 0) + 1);
  });

  return Array.from(counter.entries())
    .map(([operator, count]) => {
      const summary = summaryByOperator.get(operator);
      const totalAudits = summary?.totalAudits ?? 0;
      const noveltyCount = summary?.noveltyCount ?? 0;
      return {
        operator,
        reason: reasonLabel,
        count,
        totalAudits,
        noveltyCount,
        percentOfAudits: totalAudits ? (count / totalAudits) * 100 : 0,
        percentOfNovelties: noveltyCount ? (count / noveltyCount) * 100 : 0,
      };
    })
    .sort((a, b) => b.count - a.count || b.percentOfAudits - a.percentOfAudits || a.operator.localeCompare(b.operator, 'es'));
};

export const hasBalancedPercentages = (summary: Pick<OperatorSummary, 'validatedRate' | 'noveltyRate'>) =>
  Math.abs(summary.validatedRate + summary.noveltyRate - 100) <= 0.2;
