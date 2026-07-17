import { useMemo } from 'react';
import { ExecutiveShiftCharts, ExecutiveOperatorCharts } from '../executive/ExecutiveCharts';
import { ExecutiveOperatorFilters, ExecutiveShiftFilters } from '../executive/ExecutiveFilters';
import { ExecutiveKpis } from '../executive/ExecutiveKpis';
import { ExecutivePeriodSummary } from '../executive/ExecutivePeriodSummary';
import { AttentionRequired } from '../executive/AttentionRequired';
import { ExecutiveOperatorTable, ExecutiveShiftTable } from '../executive/ExecutiveTable';
import type { ShiftFilterState } from '../../domain/shift-metrics';
import { getShiftReasonCounts, getShiftSummariesByNoveltyVolume } from '../../domain/shift-metrics';
import type { ShiftAuditRecord, ShiftCode, ShiftSummary } from '../../domain/shift-types';
import type { AuditRecord, FilterState, KpiSummary, OperatorSummary } from '../../types/audit';
import {
  getGeneralReasonStats,
  getLowestValidationOperators,
  getOperatorsByNoveltyVolume,
  getReasonCounts,
} from '../../services/metricsService';

interface ExecutiveSummaryViewProps {
  periodLabel: string;
  viewMode: 'operators' | 'shifts';
  allRecords: AuditRecord[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onFiltersReset: () => void;
  filteredRecords: AuditRecord[];
  kpis: KpiSummary;
  operatorSummaries: OperatorSummary[];
  rankingOperatorSummaries: OperatorSummary[];
  minimumAudits: number;
  shiftFilterRecords: ShiftAuditRecord[];
  filteredShiftRecords: ShiftAuditRecord[];
  shiftFilters: ShiftFilterState;
  onShiftFiltersChange: (filters: ShiftFilterState) => void;
  onShiftFiltersReset: () => void;
  shiftKpis: KpiSummary & { shiftsWithAudits: number };
  shiftSummaries: ShiftSummary[];
  onViewDetailed: () => void;
  onSelectOperator: (operator: string) => void;
  onSelectShift: (shift: string) => void;
}

export const ExecutiveSummaryView = ({
  periodLabel,
  viewMode,
  allRecords,
  filters,
  onFiltersChange,
  onFiltersReset,
  filteredRecords,
  kpis,
  operatorSummaries,
  rankingOperatorSummaries,
  minimumAudits,
  shiftFilterRecords,
  filteredShiftRecords,
  shiftFilters,
  onShiftFiltersChange,
  onShiftFiltersReset,
  shiftKpis,
  shiftSummaries,
  onViewDetailed,
  onSelectOperator,
  onSelectShift,
}: ExecutiveSummaryViewProps) => {
  const operatorValidationRows = useMemo(() => getLowestValidationOperators(rankingOperatorSummaries, minimumAudits, 10), [minimumAudits, rankingOperatorSummaries]);
  const operatorNoveltyLeader = useMemo(() => getOperatorsByNoveltyVolume(operatorSummaries, 1)[0] ?? null, [operatorSummaries]);
  const operatorTopReasons = useMemo(() => getGeneralReasonStats(filteredRecords, 10), [filteredRecords]);
  const operatorTopReason = operatorTopReasons[0] ?? null;

  const shiftNoveltyLeader = useMemo(() => getShiftSummariesByNoveltyVolume(filteredShiftRecords)[0] ?? null, [filteredShiftRecords]);
  const shiftTopReason = useMemo(() => getReasonCounts(filteredShiftRecords)[0] ?? null, [filteredShiftRecords]);
  const activeShiftForReasons = shiftSummaries[0]?.shift ?? '';
  const shiftReasonRows = useMemo(
    () => (activeShiftForReasons ? getShiftReasonCounts(filteredShiftRecords, activeShiftForReasons as ShiftCode).slice(0, 10) : []),
    [activeShiftForReasons, filteredShiftRecords],
  );

  if (viewMode === 'shifts') {
    return (
      <>
        <ExecutiveShiftFilters records={shiftFilterRecords} filters={shiftFilters} onChange={onShiftFiltersChange} onReset={onShiftFiltersReset} />
        <ExecutivePeriodSummary periodLabel={periodLabel} viewMode="shifts" summary={shiftKpis} topReasonLabel={shiftTopReason?.label ?? null} />
        <ExecutiveKpis viewMode="shifts" summary={shiftKpis} />
        <AttentionRequired
          viewMode="shifts"
          summary={shiftKpis}
          lowestValidation={shiftSummaries[0] ?? null}
          noveltyVolumeLeader={shiftNoveltyLeader}
          topReason={shiftTopReason}
        />
        <ExecutiveShiftCharts
          validationData={shiftSummaries}
          reasonData={shiftReasonRows}
          selectedShiftLabel={activeShiftForReasons ? `del Turno ${activeShiftForReasons}` : ''}
          onSelectShift={onSelectShift}
        />
        <ExecutiveShiftTable rows={shiftSummaries} onSelectShift={onSelectShift} onViewDetailed={onViewDetailed} />
      </>
    );
  }

  return (
    <>
      <ExecutiveOperatorFilters records={allRecords} filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
      <ExecutivePeriodSummary periodLabel={periodLabel} viewMode="operators" summary={kpis} topReasonLabel={operatorTopReason?.label ?? null} />
      <ExecutiveKpis viewMode="operators" summary={kpis} />
      <AttentionRequired
        viewMode="operators"
        summary={kpis}
        lowestValidation={operatorValidationRows[0] ?? null}
        noveltyVolumeLeader={operatorNoveltyLeader}
        topReason={operatorTopReason}
      />
      <ExecutiveOperatorCharts validationData={operatorValidationRows} topReasons={operatorTopReasons} onSelectOperator={onSelectOperator} />
      <ExecutiveOperatorTable rows={operatorSummaries} minimumAudits={minimumAudits} onSelectOperator={onSelectOperator} onViewDetailed={onViewDetailed} />
    </>
  );
};
