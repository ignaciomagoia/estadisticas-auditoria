import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getValidationTone, VALIDATION_THRESHOLDS } from '../../config/validation-thresholds';
import type { OperatorSummary } from '../../types/audit';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface OperatorTableProps {
  rows: OperatorSummary[];
  minimumAudits: number;
  onSelectOperator: (operator: string) => void;
}

type SortKey = keyof OperatorSummary;

const PAGE_SIZE = 20;

const getSortValue = (row: OperatorSummary, key: SortKey) => row[key] ?? '';

const validationToneClass = (value: number) => {
  const tone = getValidationTone(value);
  if (tone === 'high') return 'bg-emerald-50 text-emerald-800 ring-emerald-100';
  if (tone === 'medium') return 'bg-amber-50 text-amber-800 ring-amber-100';
  return 'bg-rose-50 text-rose-800 ring-rose-100';
};

export const OperatorTable = ({ rows, minimumAudits, onSelectOperator }: OperatorTableProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'validatedRate', direction: 'asc' });

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-AR');
    return rows
      .filter((row) => row.operator.toLocaleLowerCase('es-AR').includes(normalizedQuery))
      .sort((a, b) => {
        const sampleResult = Number(b.totalAudits >= minimumAudits) - Number(a.totalAudits >= minimumAudits);
        const aValue = getSortValue(a, sort.key);
        const bValue = getSortValue(b, sort.key);
        const result = typeof aValue === 'number' && typeof bValue === 'number' ? aValue - bValue : String(aValue).localeCompare(String(bValue), 'es');
        return sampleResult || (sort.direction === 'asc' ? result : -result);
      });
  }, [minimumAudits, query, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
    setPage(1);
  };

  const columns: Array<{ key: SortKey; label: string; align?: 'right' }> = [
    { key: 'operator', label: 'Operador' },
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
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Tabla principal por operador</h2>
          <p className="text-sm text-slate-500">Orden inicial por porcentaje validado ascendente. Click en una fila para abrir el panel.</p>
          <p className="text-xs text-slate-500" title="Los rangos son referencias visuales configurables y no constituyen una evaluacion formal.">
            Indicador visual configurable: {VALIDATION_THRESHOLDS.high}% o mas, {VALIDATION_THRESHOLDS.medium}% a {VALIDATION_THRESHOLDS.high - 0.1}%, y menos de {VALIDATION_THRESHOLDS.medium}%.
          </p>
        </div>
        <label className="pdf-hide relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar operador"
            className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <p className="pdf-only mb-2 px-4 text-xs text-slate-500">Se muestran las primeras 20 filas segun el orden actual.</p>
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
            {pageRows.map((row) => (
              <tr key={row.operator} onClick={() => onSelectOperator(row.operator)} className="cursor-pointer transition hover:bg-sky-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                  <div className="flex items-center gap-2">
                    {row.operator}
                    {row.totalAudits < minimumAudits ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Muestra reducida</span> : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(row.totalAudits)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.validCount)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${validationToneClass(row.validatedRate)}`}>{formatPercent(row.validatedRate)}</span>
                </td>
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
      <div className="pdf-hide flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-600">
        <span>
          Pagina {page} de {pageCount} - {formatNumber(filteredRows.length)} operadores
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-md border border-slate-200 p-2 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={page === pageCount}
            className="rounded-md border border-slate-200 p-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
