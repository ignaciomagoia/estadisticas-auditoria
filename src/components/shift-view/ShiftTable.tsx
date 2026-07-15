import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ShiftSummary } from '../../domain/shift-types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface ShiftTableProps {
  rows: ShiftSummary[];
  onSelectShift: (shift: ShiftSummary['shift']) => void;
}

type SortKey = keyof ShiftSummary;

const getSortValue = (row: ShiftSummary, key: SortKey) => row[key] ?? '';

export const ShiftTable = ({ rows, onSelectShift }: ShiftTableProps) => {
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'validatedRate', direction: 'asc' });

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aValue = getSortValue(a, sort.key);
        const bValue = getSortValue(b, sort.key);
        const result = typeof aValue === 'number' && typeof bValue === 'number' ? aValue - bValue : String(aValue).localeCompare(String(bValue), 'es');
        return sort.direction === 'asc' ? result : -result;
      }),
    [rows, sort],
  );

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const columns: Array<{ key: SortKey; label: string; align?: 'right' }> = [
    { key: 'shift', label: 'Turno' },
    { key: 'operatorsCount', label: 'Operadores auditados', align: 'right' },
    { key: 'totalAudits', label: 'Total auditorias', align: 'right' },
    { key: 'validCount', label: 'Validados', align: 'right' },
    { key: 'validatedRate', label: '% validado', align: 'right' },
    { key: 'correctedCount', label: 'Corregidos', align: 'right' },
    { key: 'observedCount', label: 'Observados', align: 'right' },
    { key: 'noveltyCount', label: 'Corregidos u observados', align: 'right' },
    { key: 'noveltyRate', label: '% corregido u observado', align: 'right' },
    { key: 'topReason', label: 'Motivo mas frecuente' },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-base font-semibold text-slate-950">Tabla resumen por turno</h2>
        <p className="text-sm text-slate-500">Click en un turno para ver operadores auditados asociados.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`whitespace-nowrap px-4 py-3 font-semibold text-slate-600 ${column.align === 'right' ? 'text-right' : 'text-left'}`}>
                  <button type="button" onClick={() => handleSort(column.key)} className="inline-flex items-center gap-1">
                    {column.label}
                    <ArrowUpDown size={14} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.shift} onClick={() => onSelectShift(row.shift)} className="cursor-pointer transition hover:bg-sky-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">Turno {row.shift}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.operatorsCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.totalAudits)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.validCount)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(row.validatedRate)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.correctedCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.observedCount)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.noveltyCount)}</td>
                <td className="px-4 py-3 text-right">{formatPercent(row.noveltyRate)}</td>
                <td className="px-4 py-3 text-slate-600">{row.topReason ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
