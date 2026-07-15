import { useMemo, useState } from 'react';
import type { FilterState, OperatorSummary } from '../../types/audit';
import type { OperatorShiftMatchReport, ShiftAuditRecord, ShiftCode } from '../../domain/shift-types';
import {
  applyCompatibleOperatorFiltersForShifts,
  applyShiftFilters,
  getShiftKpis,
  getShiftOperatorSummaries,
  getShiftReasonCounts,
  getShiftReasons,
  getShiftSummaries,
  getShiftSummariesByNoveltyVolume,
  getShiftsForReason,
} from '../../domain/shift-metrics';
import type { ShiftFilterState } from '../../domain/shift-metrics';
import { formatNumber } from '../../utils/formatters';
import { ChartCard } from '../charts/ChartCard';
import { ShiftFilterBar } from './ShiftFilterBar';
import { ShiftKpiGrid } from './ShiftKpiGrid';
import { ShiftDetailPanel } from './ShiftDetailPanel';
import { ShiftTable } from './ShiftTable';
import { ShiftNoveltyVolumeChart, ShiftReasonsChart, ShiftsForReasonChart, ShiftValidationChart } from './ShiftCharts';

interface ShiftViewProps {
  records: ShiftAuditRecord[];
  matchReport: OperatorShiftMatchReport;
  globalFilters: FilterState;
  filters: ShiftFilterState;
  onFiltersChange: (filters: ShiftFilterState) => void;
  onFiltersReset: () => void;
}

export const ShiftView = ({ records, matchReport, globalFilters, filters, onFiltersChange, onFiltersReset }: ShiftViewProps) => {
  const [selectedShiftForReasons, setSelectedShiftForReasons] = useState<ShiftCode | ''>('');
  const [selectedReason, setSelectedReason] = useState('');
  const [detailShift, setDetailShift] = useState<ShiftCode | null>(null);

  const compatibleRecords = useMemo(() => applyCompatibleOperatorFiltersForShifts(records, globalFilters), [globalFilters, records]);
  const filteredRecords = useMemo(() => applyShiftFilters(compatibleRecords, filters), [compatibleRecords, filters]);
  const kpis = useMemo(() => getShiftKpis(filteredRecords), [filteredRecords]);
  const summaries = useMemo(() => getShiftSummaries(filteredRecords), [filteredRecords]);
  const volumeSummaries = useMemo(() => getShiftSummariesByNoveltyVolume(filteredRecords), [filteredRecords]);
  const availableReasons = useMemo(() => getShiftReasons(filteredRecords), [filteredRecords]);
  const activeReason = availableReasons.includes(selectedReason) ? selectedReason : (availableReasons[0] ?? '');
  const activeShiftForReasons = summaries.some((summary) => summary.shift === selectedShiftForReasons) ? selectedShiftForReasons : (summaries[0]?.shift ?? '');
  const shiftReasons = useMemo(
    () => (activeShiftForReasons ? getShiftReasonCounts(filteredRecords, activeShiftForReasons) : []),
    [activeShiftForReasons, filteredRecords],
  );
  const shiftsForReason = useMemo(() => (activeReason ? getShiftsForReason(filteredRecords, activeReason) : []), [activeReason, filteredRecords]);
  const detailSummary = summaries.find((summary) => summary.shift === detailShift) ?? null;
  const detailOperators: OperatorSummary[] = detailShift ? getShiftOperatorSummaries(filteredRecords, detailShift) : [];

  if (records.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
        No se pudieron asociar operadores auditados con la nomina de turnos.
      </section>
    );
  }

  return (
    <>
      <ShiftFilterBar records={compatibleRecords} filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
      {filteredRecords.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">No hay auditorias asociadas a turnos para los filtros seleccionados.</section>
      ) : (
        <>
          <ShiftKpiGrid summary={kpis} />
          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Porcentaje de validacion por turno">
              <ShiftValidationChart data={summaries} />
            </ChartCard>
            <ChartCard title="Correcciones y observaciones por turno" subtitle="Este grafico muestra volumen absoluto y puede estar influido por la cantidad de auditorias de cada turno.">
              <ShiftNoveltyVolumeChart data={volumeSummaries} />
            </ChartCard>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Motivos de correccion por turno</h2>
                <p className="mt-1 text-sm text-slate-500">Incluye solo casos corregidos y observados.</p>
              </div>
              <select
                value={activeShiftForReasons}
                onChange={(event) => setSelectedShiftForReasons(event.target.value as ShiftCode)}
                className="pdf-hide h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-52"
              >
                {summaries.map((summary) => (
                  <option key={summary.shift} value={summary.shift}>
                    Turno {summary.shift}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-80">
              <ShiftReasonsChart data={shiftReasons} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Comparacion de turnos por motivo</h2>
                <p className="mt-1 text-sm text-slate-500">Compara un motivo estructurado entre turnos.</p>
              </div>
              <select
                value={activeReason}
                onChange={(event) => setSelectedReason(event.target.value)}
                className="pdf-hide h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-80"
              >
                {availableReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-80">
              <ShiftsForReasonChart data={shiftsForReason} />
            </div>
          </section>

          <ShiftTable rows={summaries} onSelectShift={setDetailShift} />
          <details className="pdf-hide rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <summary className="cursor-pointer font-semibold text-slate-900">Calidad de asociacion de nombres</summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <span>Operadores auditados: {formatNumber(matchReport.totalAuditOperators)}</span>
              <span>Operadores asociados: {formatNumber(matchReport.matches.length)}</span>
              <span>Operadores sin asociacion: {formatNumber(matchReport.unmatchedOperators.length)}</span>
              <span>Coincidencias ambiguas: {formatNumber(matchReport.ambiguousMatches.length)}</span>
              <span>Auditorias asociadas: {formatNumber(matchReport.associatedAuditCount)} de {formatNumber(matchReport.associatedAuditCount + matchReport.excludedAuditCount)}</span>
            </div>
            <details className="mt-4 rounded-md border border-slate-200 p-3">
              <summary className="cursor-pointer font-medium text-slate-800">Ver operadores sin asociacion o ambiguos</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Operador</th>
                      <th className="px-3 py-2">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matchReport.unmatchedOperators.slice(0, 30).map((operator) => (
                      <tr key={`unmatched-${operator.operatorName}`}>
                        <td className="px-3 py-2">Sin asociacion</td>
                        <td className="px-3 py-2">{operator.operatorName}</td>
                        <td className="px-3 py-2">{operator.reason}</td>
                      </tr>
                    ))}
                    {matchReport.ambiguousMatches.slice(0, 30).map((match) => (
                      <tr key={`ambiguous-${match.operatorName}`}>
                        <td className="px-3 py-2">Ambiguo</td>
                        <td className="px-3 py-2">{match.operatorName}</td>
                        <td className="px-3 py-2">{match.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </details>
          <ShiftDetailPanel shift={detailShift} summary={detailSummary} operators={detailOperators} onClose={() => setDetailShift(null)} />
        </>
      )}
    </>
  );
};
