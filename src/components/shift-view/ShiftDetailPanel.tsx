import { X } from 'lucide-react';
import type { OperatorSummary } from '../../types/audit';
import type { ShiftCode, ShiftSummary } from '../../domain/shift-types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface ShiftDetailPanelProps {
  shift: ShiftCode | null;
  summary: ShiftSummary | null;
  operators: OperatorSummary[];
  onClose: () => void;
}

export const ShiftDetailPanel = ({ shift, summary, operators, onClose }: ShiftDetailPanelProps) => {
  if (!shift || !summary) return null;

  return (
    <div className="pdf-hide fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm" role="dialog" aria-modal="true">
      <aside className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Detalle del turno</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Turno {shift}</h2>
          </div>
          <button type="button" onClick={onClose} title="Cerrar panel" className="rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Operadores auditados', formatNumber(summary.operatorsCount)],
              ['Total auditorias', formatNumber(summary.totalAudits)],
              ['Validados', formatNumber(summary.validCount)],
              ['Corregidos', formatNumber(summary.correctedCount)],
              ['Observados', formatNumber(summary.observedCount)],
              ['% validado', formatPercent(summary.validatedRate)],
              ['% corregido u observado', formatPercent(summary.noveltyRate)],
              ['Motivo frecuente', summary.topReason ?? '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-1 break-words text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-950">Operadores auditados del turno</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Operador</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">% validado</th>
                    <th className="px-4 py-3 text-right">Corregidos</th>
                    <th className="px-4 py-3 text-right">Observados</th>
                    <th className="px-4 py-3">Motivo mas frecuente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operators.map((operator) => (
                    <tr key={operator.operator}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">{operator.operator}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(operator.totalAudits)}</td>
                      <td className="px-4 py-3 text-right">{formatPercent(operator.validatedRate)}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(operator.correctedCount)}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(operator.observedCount)}</td>
                      <td className="px-4 py-3 text-slate-600">{operator.topReason ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
