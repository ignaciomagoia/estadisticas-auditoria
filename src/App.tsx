import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { DownloadAuditReportButton } from './components/export/DownloadAuditReportButton';
import { DashboardHeader } from './components/layout/DashboardHeader';
import { PageShell } from './components/layout/PageShell';
import { DashboardModeSelector, type DashboardDisplayMode } from './components/views/DashboardModeSelector';
import { DetailedAnalysisView } from './components/views/DetailedAnalysisView';
import { ExecutiveSummaryView } from './components/views/ExecutiveSummaryView';
import { attachShiftsToAuditRecords, matchOperatorsToShifts } from './data/operator-shift-matcher';
import { applyCompatibleOperatorFiltersForShifts, applyShiftFilters, EMPTY_SHIFT_FILTERS, getShiftKpis, getShiftSummaries, type ShiftFilterState } from './domain/shift-metrics';
import { useAuditDataset } from './hooks/useAuditDataset';
import { useShiftRoster } from './hooks/useShiftRoster';
import { applyAuditFilters, applyAuditFiltersWithoutAction, EMPTY_FILTERS } from './services/filterService';
import { getKpiSummary, getOperatorSummaries } from './services/metricsService';
import type { FilterState } from './types/audit';
import type { OperatorShiftMatchReport } from './domain/shift-types';
import { buildOperatorAuditReportPayload, buildShiftAuditReportPayload } from './pdf/audit-report-data';

type ViewMode = 'operators' | 'shifts';
type AnalysisMode = 'monthly' | 'compare';

const isDashboardDisplayMode = (value: string | null): value is DashboardDisplayMode => value === 'executive' || value === 'detailed';

const getInitialDashboardMode = (): DashboardDisplayMode => {
  if (typeof window === 'undefined') return 'detailed';
  const urlMode = new URLSearchParams(window.location.search).get('mode');
  if (isDashboardDisplayMode(urlMode)) return urlMode;
  return 'detailed';
};

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

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatFilterSummary = (entries: Array<[string, string]>) => entries.filter(([, value]) => Boolean(value)).map(([label, value]) => `${label}: ${value}`);

const App = () => {
  const { dataset, periods, selectedPeriod, selectedPeriodId, setSelectedPeriodId, isLoading, error } = useAuditDataset();
  const { roster, isLoading: isRosterLoading, error: rosterError } = useShiftRoster();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [minimumAudits, setMinimumAudits] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('operators');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('monthly');
  const [dashboardMode, setDashboardMode] = useState<DashboardDisplayMode>(getInitialDashboardMode);
  const [shiftFilters, setShiftFilters] = useState<ShiftFilterState>(EMPTY_SHIFT_FILTERS);

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
  const compatibleShiftRecordsForReport = useMemo(() => applyCompatibleOperatorFiltersForShifts(shiftRecords, filters), [filters, shiftRecords]);
  const effectiveShiftFilters = useMemo<ShiftFilterState>(
    () => ({
      shift: shiftFilters.shift,
      auditor: shiftFilters.auditor || filters.auditor,
      affectedSystem: shiftFilters.affectedSystem || filters.affectedSystem,
      correctionReason: shiftFilters.correctionReason || filters.correctionReason,
    }),
    [filters.auditor, filters.affectedSystem, filters.correctionReason, shiftFilters],
  );
  const filteredShiftRecordsForReport = useMemo(() => applyShiftFilters(shiftRecords, effectiveShiftFilters), [effectiveShiftFilters, shiftRecords]);
  const shiftKpisForReport = useMemo(() => getShiftKpis(filteredShiftRecordsForReport), [filteredShiftRecordsForReport]);
  const shiftSummariesForReport = useMemo(() => getShiftSummaries(filteredShiftRecordsForReport), [filteredShiftRecordsForReport]);
  const isShiftViewDisabled = isRosterLoading || Boolean(rosterError) || !roster;
  const periodLabel = dataset?.meta.monthLabel ?? selectedPeriod?.monthLabel ?? 'Periodo';
  const viewLabel = analysisMode === 'compare' ? 'Comparacion' : viewMode === 'operators' ? 'Operadores' : 'Turnos';
  const filtersSummary = useMemo(() => {
    if (analysisMode === 'compare') return [];
    if (viewMode === 'operators') {
      return formatFilterSummary([
        ['Operador', filters.operator],
        ['Auditor', filters.auditor],
        ['Accion', filters.action],
        ['Sistema', filters.affectedSystem],
        ['Motivo', filters.correctionReason],
      ]);
    }
    return formatFilterSummary([
      ['Turno', effectiveShiftFilters.shift ? `Turno ${effectiveShiftFilters.shift}` : ''],
      ['Auditor', effectiveShiftFilters.auditor],
      ['Sistema', effectiveShiftFilters.affectedSystem],
      ['Motivo', effectiveShiftFilters.correctionReason],
    ]);
  }, [analysisMode, effectiveShiftFilters, filters, viewMode]);
  const auditReportPayload = useMemo(() => {
    if (analysisMode === 'compare') return null;
    if (viewMode === 'operators') {
      return buildOperatorAuditReportPayload({
        periodLabel,
        filtersSummary,
        kpis,
        records: filteredRecords,
        summaries: operatorSummaries,
        rankingSummaries: rankingOperatorSummaries,
        minimumAudits,
        reportScope: dashboardMode,
      });
    }

    if (filteredShiftRecordsForReport.length === 0) return null;
    return buildShiftAuditReportPayload({
      periodLabel,
      filtersSummary,
      kpis: shiftKpisForReport,
      records: filteredShiftRecordsForReport,
      summaries: shiftSummariesForReport,
      reportScope: dashboardMode,
    });
  }, [
    analysisMode,
    dashboardMode,
    filteredRecords,
    filteredShiftRecordsForReport,
    filtersSummary,
    kpis,
    minimumAudits,
    operatorSummaries,
    periodLabel,
    rankingOperatorSummaries,
    shiftKpisForReport,
    shiftSummariesForReport,
    viewMode,
  ]);
  const pdfFileName = `informe-auditorias-${slugify(periodLabel)}-${viewMode === 'operators' ? 'operadores' : 'turnos'}.pdf`;

  const handleExecutiveShiftFiltersChange = (nextFilters: ShiftFilterState) => {
    setShiftFilters(nextFilters);
    setFilters((current) => ({
      ...current,
      auditor: '',
      affectedSystem: '',
      correctionReason: '',
    }));
  };

  const handleExecutiveShiftFiltersReset = () => {
    setShiftFilters(EMPTY_SHIFT_FILTERS);
    setFilters((current) => ({
      ...current,
      auditor: '',
      affectedSystem: '',
      correctionReason: '',
    }));
  };

  const showDetailedAnalysis = () => {
    setDashboardMode('detailed');
  };

  const selectOperatorFromExecutive = (operator: string) => {
    setAnalysisMode('monthly');
    setViewMode('operators');
    setFilters((current) => ({ ...current, operator, action: '' }));
    setSelectedOperator(operator);
    setDashboardMode('detailed');
  };

  const selectShiftFromExecutive = (shift: string) => {
    setAnalysisMode('monthly');
    setViewMode('shifts');
    setShiftFilters((current) => ({ ...current, shift }));
    setDashboardMode('detailed');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('audit-dashboard-mode', dashboardMode);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', dashboardMode);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [dashboardMode]);

  useEffect(() => {
    if (dashboardMode !== 'executive') return;
    setFilters((current) => (current.action ? { ...current, action: '' } : current));
  }, [dashboardMode]);

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
        modeSelector={<DashboardModeSelector mode={dashboardMode} onChange={setDashboardMode} />}
        exportButton={
          <DownloadAuditReportButton
            report={auditReportPayload}
            fileName={pdfFileName}
            disabled={isLoading || Boolean(error) || !auditReportPayload}
          />
        }
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
        <div className="grid min-w-0 max-w-full gap-6">
          {dashboardMode === 'executive' && analysisMode === 'monthly' ? (
            <ExecutiveSummaryView
              periodLabel={periodLabel}
              viewMode={viewMode}
              allRecords={allRecords}
              filters={filters}
              onFiltersChange={setFilters}
              onFiltersReset={() => setFilters(EMPTY_FILTERS)}
              filteredRecords={filteredRecords}
              kpis={kpis}
              operatorSummaries={operatorSummaries}
              rankingOperatorSummaries={rankingOperatorSummaries}
              minimumAudits={minimumAudits}
              shiftFilterRecords={compatibleShiftRecordsForReport}
              filteredShiftRecords={filteredShiftRecordsForReport}
              shiftFilters={effectiveShiftFilters}
              onShiftFiltersChange={handleExecutiveShiftFiltersChange}
              onShiftFiltersReset={handleExecutiveShiftFiltersReset}
              shiftKpis={shiftKpisForReport}
              shiftSummaries={shiftSummariesForReport}
              onViewDetailed={showDetailedAnalysis}
              onSelectOperator={selectOperatorFromExecutive}
              onSelectShift={selectShiftFromExecutive}
            />
          ) : (
            <DetailedAnalysisView
              analysisMode={analysisMode}
              viewMode={viewMode}
              periods={periods}
              allRecords={allRecords}
              filteredRecords={filteredRecords}
              rankingRecords={rankingRecords}
              filters={filters}
              onFiltersChange={setFilters}
              onFiltersReset={() => setFilters(EMPTY_FILTERS)}
              kpis={kpis}
              operatorSummaries={operatorSummaries}
              rankingOperatorSummaries={rankingOperatorSummaries}
              minimumAudits={minimumAudits}
              onMinimumAuditsChange={setMinimumAudits}
              isActionFiltered={isActionFiltered}
              selectedOperator={selectedOperator}
              selectedSummary={selectedSummary}
              onSelectOperator={setSelectedOperator}
              shiftRecords={shiftRecords}
              shiftMatchReport={shiftMatchReport}
              shiftFilters={shiftFilters}
              onShiftFiltersChange={setShiftFilters}
              onShiftFiltersReset={() => setShiftFilters(EMPTY_SHIFT_FILTERS)}
            />
          )}
        </div>
      )}
    </PageShell>
  );
};

export default App;
