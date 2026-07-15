import { AlertCircle, CheckCircle2, FileCheck2, Percent, SearchCheck, UserRoundCheck, Users } from 'lucide-react';
import type { KpiSummary } from '../../types/audit';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface KpiGridProps {
  summary: KpiSummary;
}

const KPI_CONFIG = [
  { key: 'totalAudits', label: 'Total auditorias', icon: FileCheck2 },
  {
    key: 'validatedRate',
    label: 'Porcentaje validado',
    icon: Percent,
    tooltip: 'Casos validados sobre el total de casos con accion Validado, Corregido u Observado.',
  },
  {
    key: 'noveltyRate',
    label: '% corregido u observado',
    icon: Percent,
    tooltip: 'Casos corregidos u observados sobre el total de casos con accion reconocida.',
  },
  { key: 'totalOperators', label: 'Operadores auditados', icon: Users },
  { key: 'validCount', label: 'Casos validados', icon: CheckCircle2 },
  { key: 'correctedCount', label: 'Casos corregidos', icon: SearchCheck },
  { key: 'observedCount', label: 'Casos observados', icon: AlertCircle },
  { key: 'noveltyCount', label: 'Casos corregidos u observados', icon: UserRoundCheck },
] as const;

export const KpiGrid = ({ summary }: KpiGridProps) => (
  <section className="pdf-section grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {KPI_CONFIG.map((item) => {
      const { key, label, icon: Icon } = item;
      const tooltip = 'tooltip' in item ? item.tooltip : undefined;
      const rawValue = summary[key];
      const value = key === 'noveltyRate' || key === 'validatedRate' ? formatPercent(Number(rawValue)) : formatNumber(Number(rawValue));

      return (
        <article key={key} title={tooltip} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
            </div>
            <span className="rounded-md bg-sky-50 p-2 text-sky-700">
              <Icon size={18} />
            </span>
          </div>
        </article>
      );
    })}
  </section>
);
