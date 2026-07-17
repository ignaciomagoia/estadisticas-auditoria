import type { KpiSummary } from '../../types/audit';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface ExecutiveKpisProps {
  viewMode: 'operators' | 'shifts';
  summary: KpiSummary & { shiftsWithAudits?: number };
}

export const ExecutiveKpis = ({ viewMode, summary }: ExecutiveKpisProps) => {
  const items = [
    [viewMode === 'operators' ? 'Total auditorias' : 'Total auditorias asociadas', formatNumber(summary.totalAudits)],
    [viewMode === 'operators' ? 'Porcentaje validado' : 'Porcentaje validado general', formatPercent(summary.validatedRate)],
    [viewMode === 'operators' ? '% corregido u observado' : '% corregido u observado general', formatPercent(summary.noveltyRate)],
    [viewMode === 'operators' ? 'Operadores auditados' : 'Turnos con auditorias', formatNumber(viewMode === 'operators' ? summary.totalOperators : (summary.shiftsWithAudits ?? 0))],
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <article key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </article>
      ))}
    </section>
  );
};
