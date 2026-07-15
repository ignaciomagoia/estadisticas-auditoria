import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { CompareMonthsPlaceholder } from './components/comparison/CompareMonthsPlaceholder';
import { ComplementaryChartsSection } from './components/charts/ComplementaryChartsSection';
import { PriorityChartsSection } from './components/charts/PriorityChartsSection';
import { ValidationRankingSection } from './components/charts/ValidationRankingSection';
import { FilterBar } from './components/filters/FilterBar';
import { KpiGrid } from './components/kpis/KpiGrid';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { PageShell } from './components/layout/PageShell';
import { OperatorPanel } from './components/operator/OperatorPanel';
import { OperatorMotivesSection } from './components/operator/OperatorMotivesSection';
import { ReasonInsightsSection } from './components/operator/ReasonInsightsSection';
import { OperatorTable } from './components/table/OperatorTable';
import { ShiftView } from './components/shift-view/ShiftView';
import { attachShiftsToAuditRecords, matchOperatorsToShifts } from './data/operator-shift-matcher';
import { useAuditDataset } from './hooks/useAuditDataset';
import { useShiftRoster } from './hooks/useShiftRoster';
import { applyAuditFilters, applyAuditFiltersWithoutAction, EMPTY_FILTERS } from './services/filterService';
import { getKpiSummary, getOperatorSummaries } from './services/metricsService';
import type { FilterState } from './types/audit';
import type { OperatorShiftMatchReport } from './domain/shift-types';

type ViewMode = 'operators' | 'shifts';
type AnalysisMode = 'monthly' | 'compare';

const EMPTY_SHIFT_REPORT: OperatorShiftMatchReport = {
  matches: [],
  unmatchedOperators: [],
  ambiguousMatches: [],
  rosterMembersWithoutAudits: [],
  totalAuditOperators: 0,
  totalRosterMembers: 0,
  exactMatchCount: 0,
  containedWordsMatchCount: 0,
  aliasMatchCount: 0,
  associatedAuditCount: 0,
  excludedAuditCount: 0,
  excludedAuditRanking: [],
};

const App = () => {
  const { dataset, periods, selectedPeriod, selectedPeriodId, setSelectedPeriodId, isLoading, error } = useAuditDataset();
  const { roster, isLoading: isRosterLoading, error: rosterError } = useShiftRoster();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [minimumAudits, setMinimumAudits] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('operators');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('monthly');

  const allRecords = dataset?.records ?? [];
  const filteredRecords = useMemo(() => applyAuditFilters(allRecords, filters), [allRecords, filters]);
  const rankingRecords = useMemo(() => applyAuditFiltersWithoutAction(allRecords, filters), [allRecords, filters]);
  const kpis = useMemo(() => getKpiSummary(filteredRecords), [filteredRecords]);
  const operatorSummaries = useMemo(() => getOperatorSummaries(filteredRecords), [filteredRecords]);
  const rankingOperatorSummaries = useMemo(() => getOperatorSummaries(rankingRecords), [rankingRecords]);
  const selectedSummary = operatorSummaries.find((summary) => summary.operator === selectedOperator) ?? null;
  const isActionFiltered = Boolean(filters.action);
  const shiftMatchReport = useMemo(() => (roster ? matchOperatorsToShifts(allRecords, roster.members) : EMPTY_SHIFT_REPORT), [allRecords, roster]);
  const shiftRecords = useMemo(() => attachShiftsToAuditRecords(allRecords, shiftMatchReport), [allRecords, shiftMatchReport]);
  const isShiftViewDisabled = isRosterLoading || Boolean(rosterError) || !roster;

  useEffect(() => {
    if (isShiftViewDisabled && viewMode === 'shifts') setViewMode('operators');
  }, [isShiftViewDisabled, viewMode]);

  useEffect(() => {
    if (periods.length < 2 && analysisMode === 'compare') setAnalysisMode('monthly');
  }, [analysisMode, periods.length]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!roster || allRecords.length === 0) return;
    console.table([
      {
        operadoresAuditados: shiftMatchReport.totalAuditOperators,
        personasNomina: shiftMatchReport.totalRosterMembers,
        operadoresAsociados: shiftMatchReport.matches.length,
        exactMatch: shiftMatchReport.exactMatchCount,
        containedWordsMatch: shiftMatchReport.containedWordsMatchCount,
        aliasMatch: shiftMatchReport.aliasMatchCount,
        ambiguos: shiftMatchReport.ambiguousMatches.length,
        noAsociados: shiftMatchReport.unmatchedOperators.length,
        auditoriasAsociadas: shiftMatchReport.associatedAuditCount,
        auditoriasExcluidas: shiftMatchReport.excludedAuditCount,
      },
    ]);
    console.table(
      shiftMatchReport.excludedAuditRanking.slice(0, 20).map((item) => ({
        operadorSinAsociacion: item.operatorName,
        auditorias: item.auditCount,
      })),
    );
  }, [allRecords.length, roster, shiftMatchReport]);

  return (
    <PageShell>
      <DashboardHeader
        meta={dataset?.meta ?? selectedPeriod}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        analysisMode={analysisMode}
        onAnalysisModeChange={setAnalysisMode}
        isShiftViewDisabled={isShiftViewDisabled}
      />

      {isLoading ? (
        <section className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin" size={22} />
            Cargando auditorias...
          </div>
        </section>
      ) : error ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <AlertTriangle size={22} />
            <div>
              <h2 className="font-semibold">No se pudo iniciar el dashboard</h2>
              <p className="mt-1 text-sm">{error}</p>
              <p className="mt-2 text-sm">Verifica public/data/auditorias/index.json y que los Excel listados existan dentro de public/data/auditorias.</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {analysisMode === 'compare' ? (
            <CompareMonthsPlaceholder periods={periods} />
          ) : viewMode === 'operators' ? (
            <>
              <FilterBar records={allRecords} filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
              <KpiGrid summary={kpis} />
              <ValidationRankingSection
                rankingSummaries={rankingOperatorSummaries}
                minimumAudits={minimumAudits}
                onMinimumAuditsChange={setMinimumAudits}
                isActionFiltered={isActionFiltered}
              />
              <OperatorMotivesSection records={filteredRecords} summaries={operatorSummaries} />
              <ReasonInsightsSection records={filteredRecords} summaries={operatorSummaries} />
              <PriorityChartsSection records={filteredRecords} summaries={operatorSummaries} />
              <OperatorTable rows={operatorSummaries} minimumAudits={minimumAudits} onSelectOperator={setSelectedOperator} />
              <OperatorPanel operator={selectedOperator} records={filteredRecords} summary={selectedSummary} onClose={() => setSelectedOperator(null)} />
              <ComplementaryChartsSection records={filteredRecords} rankingRecords={rankingRecords} />
            </>
          ) : (
            <ShiftView records={shiftRecords} matchReport={shiftMatchReport} globalFilters={filters} />
          )}
        </>
      )}
    </PageShell>
  );
};

export default App;
