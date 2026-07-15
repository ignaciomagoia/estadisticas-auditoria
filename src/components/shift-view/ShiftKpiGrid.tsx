import { CheckCircle2, FileCheck2, Percent, SearchCheck, UserRoundCheck, Users } from 'lucide-react';
import type { getShiftKpis } from '../../domain/shift-metrics';
import { formatNumber, formatPercent } from '../../utils/formatters';

type ShiftKpis = ReturnType<typeof getShiftKpis>;

interface ShiftKpiGridProps {
  summary: ShiftKpis;
}

const KPI_CONFIG = [
  { key: 'shiftsWithAudits', label: 'Turnos con auditorias', icon: Users },
  { key: 'totalAudits', label: 'Total auditorias asociadas', icon: FileCheck2 },
  { key: 'validatedRate', label: 'Porcentaje validado general', icon: Percent },
  { key: 'noveltyRate', label: '% corregido u observado general', icon: Percent },
  { key: 'validCount', label: 'Casos validados', icon: CheckCircle2 },
  { key: 'correctedCount', label: 'Casos corregidos', icon: SearchCheck },
  { key: 'observedCount', label: 'Casos observados', icon: SearchCheck },
  { key: 'associatedOperators', label: 'Operadores asociados a turnos', icon: UserRoundCheck },
] as const;

export const ShiftKpiGrid = ({ summary }: ShiftKpiGridProps) => (
  <section className="pdf-section grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {KPI_CONFIG.map(({ key, label, icon: Icon }) => {
      const value = key === 'validatedRate' || key === 'noveltyRate' ? formatPercent(Number(summary[key])) : formatNumber(Number(summary[key]));
      return (
        <article key={key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
