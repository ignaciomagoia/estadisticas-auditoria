import type { Dispatch, SetStateAction } from 'react';
import { CompareMonthsPlaceholder } from '../comparison/CompareMonthsPlaceholder';
import { ComplementaryChartsSection } from '../charts/ComplementaryChartsSection';
import { PriorityChartsSection } from '../charts/PriorityChartsSection';
import { ValidationRankingSection } from '../charts/ValidationRankingSection';
import { FilterBar } from '../filters/FilterBar';
import { KpiGrid } from '../kpis/KpiGrid';
import { OperatorPanel } from '../operator/OperatorPanel';
import { OperatorMotivesSection } from '../operator/OperatorMotivesSection';
import { ReasonInsightsSection } from '../operator/ReasonInsightsSection';
import { ShiftView } from '../shift-view/ShiftView';
import { OperatorTable } from '../table/OperatorTable';
import type { ShiftFilterState } from '../../domain/shift-metrics';
import type { OperatorShiftMatchReport, ShiftAuditRecord } from '../../domain/shift-types';
import type { AuditRecord, DatasetMeta, FilterState, KpiSummary, OperatorSummary } from '../../types/audit';

interface DetailedAnalysisViewProps {
  analysisMode: 'monthly' | 'compare';
  viewMode: 'operators' | 'shifts';
  periods: DatasetMeta[];
  allRecords: AuditRecord[];
  filteredRecords: AuditRecord[];
  rankingRecords: AuditRecord[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onFiltersReset: () => void;
  kpis: KpiSummary;
  operatorSummaries: OperatorSummary[];
  rankingOperatorSummaries: OperatorSummary[];
  minimumAudits: number;
  onMinimumAuditsChange: (value: number) => void;
  isActionFiltered: boolean;
  selectedOperator: string | null;
  selectedSummary: OperatorSummary | null;
  onSelectOperator: Dispatch<SetStateAction<string | null>>;
  shiftRecords: ShiftAuditRecord[];
  shiftMatchReport: OperatorShiftMatchReport;
  shiftFilters: ShiftFilterState;
  onShiftFiltersChange: (filters: ShiftFilterState) => void;
  onShiftFiltersReset: () => void;
}

export const DetailedAnalysisView = ({
  analysisMode,
  viewMode,
  periods,
  allRecords,
  filteredRecords,
  rankingRecords,
  filters,
  onFiltersChange,
  onFiltersReset,
  kpis,
  operatorSummaries,
  rankingOperatorSummaries,
  minimumAudits,
  onMinimumAuditsChange,
  isActionFiltered,
  selectedOperator,
  selectedSummary,
  onSelectOperator,
  shiftRecords,
  shiftMatchReport,
  shiftFilters,
  onShiftFiltersChange,
  onShiftFiltersReset,
}: DetailedAnalysisViewProps) => {
  if (analysisMode === 'compare') return <CompareMonthsPlaceholder periods={periods} />;

  if (viewMode === 'shifts') {
    return (
      <ShiftView
        records={shiftRecords}
        matchReport={shiftMatchReport}
        globalFilters={filters}
        filters={shiftFilters}
        onFiltersChange={onShiftFiltersChange}
        onFiltersReset={onShiftFiltersReset}
      />
    );
  }

  return (
    <>
      <FilterBar records={allRecords} filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
      <KpiGrid summary={kpis} />
      <ValidationRankingSection
        rankingSummaries={rankingOperatorSummaries}
        minimumAudits={minimumAudits}
        onMinimumAuditsChange={onMinimumAuditsChange}
        isActionFiltered={isActionFiltered}
      />
      <OperatorMotivesSection records={filteredRecords} summaries={operatorSummaries} />
      <ReasonInsightsSection records={filteredRecords} summaries={operatorSummaries} />
      <PriorityChartsSection records={filteredRecords} summaries={operatorSummaries} />
      <OperatorTable rows={operatorSummaries} minimumAudits={minimumAudits} onSelectOperator={onSelectOperator} />
      <OperatorPanel operator={selectedOperator} records={filteredRecords} summary={selectedSummary} onClose={() => onSelectOperator(null)} />
      <ComplementaryChartsSection records={filteredRecords} rankingRecords={rankingRecords} />
    </>
  );
};
