import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { OperatorSummary } from '../../types/audit';
import type { ShiftSummary } from '../../domain/shift-types';
import { formatNumber, formatPercent } from '../../utils/formatters';

type Direction = 'asc' | 'desc';

const sortValue = <T,>(row: T, key: keyof T) => row[key] ?? '';

const SortButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1">
    {label}
    <ArrowUpDown size={13} />
  </button>
);

export const ExecutiveOperatorTable = ({
  rows,
  minimumAudits,
  onSelectOperator,
  onViewDetailed,
}: {
  rows: OperatorSummary[];
  minimumAudits: number;
  onSelectOperator: (operator: string) => void;
  onViewDetailed: () => void;
}) => {
  const [sort, setSort] = useState<{ key: keyof OperatorSummary; direction: Direction }>({ key: 'validatedRate', direction: 'asc' });
  const sortedRows = useMemo(
    () =>
      rows
        .filter((row) => row.totalAudits >= minimumAudits)
        .sort((a, b) => {
          const aValue = sortValue(a, sort.key);
          const bValue = sortValue(b, sort.key);
          const result = typeof aValue === 'number' && typeof bValue === 'number' ? aValue - bValue : String(aValue).localeCompare(String(bValue), 'es');
          return sort.direction === 'asc' ? result : -result;
        })
        .slice(0, 10),
    [minimumAudits, rows, sort],
  );

  const handleSort = (key: keyof OperatorSummary) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Tabla resumen compacta</h2>
          <p className="text-sm text-slate-500">Primeras 10 filas, con minimo de {minimumAudits} auditorias.</p>
        </div>
        <button type="button" onClick={onViewDetailed} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Ver analisis detallado
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold"><SortButton label="Operador" onClick={() => handleSort('operator')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Total auditorias" onClick={() => handleSort('totalAudits')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="% validado" onClick={() => handleSort('validatedRate')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Corregidos" onClick={() => handleSort('correctedCount')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Observados" onClick={() => handleSort('observedCount')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold"><SortButton label="Motivo mas frecuente" onClick={() => handleSort('topReason')} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.operator} onClick={() => onSelectOperator(row.operator)} className="cursor-pointer transition hover:bg-sky-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">{row.operator}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.totalAudits)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(row.validatedRate)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.correctedCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.observedCount)}</td>
                <td className="px-4 py-3 text-slate-600">{row.topReason ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const ExecutiveShiftTable = ({
  rows,
  onSelectShift,
  onViewDetailed,
}: {
  rows: ShiftSummary[];
  onSelectShift: (shift: string) => void;
  onViewDetailed: () => void;
}) => {
  const [sort, setSort] = useState<{ key: keyof ShiftSummary; direction: Direction }>({ key: 'validatedRate', direction: 'asc' });
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aValue = sortValue(a, sort.key);
        const bValue = sortValue(b, sort.key);
        const result = typeof aValue === 'number' && typeof bValue === 'number' ? aValue - bValue : String(aValue).localeCompare(String(bValue), 'es');
        return sort.direction === 'asc' ? result : -result;
      }),
    [rows, sort],
  );

  const handleSort = (key: keyof ShiftSummary) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Tabla resumen compacta</h2>
          <p className="text-sm text-slate-500">Se muestran todos los turnos disponibles.</p>
        </div>
        <button type="button" onClick={onViewDetailed} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Ver analisis detallado
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold"><SortButton label="Turno" onClick={() => handleSort('shift')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Operadores auditados" onClick={() => handleSort('operatorsCount')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Total auditorias" onClick={() => handleSort('totalAudits')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="% validado" onClick={() => handleSort('validatedRate')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Corregidos" onClick={() => handleSort('correctedCount')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold"><SortButton label="Observados" onClick={() => handleSort('observedCount')} /></th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold"><SortButton label="Motivo mas frecuente" onClick={() => handleSort('topReason')} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.shift} onClick={() => onSelectShift(row.shift)} className="cursor-pointer transition hover:bg-sky-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">Turno {row.shift}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.operatorsCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.totalAudits)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(row.validatedRate)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.correctedCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.observedCount)}</td>
                <td className="px-4 py-3 text-slate-600">{row.topReason ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
