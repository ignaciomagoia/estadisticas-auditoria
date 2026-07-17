import type { KpiSummary } from '../../types/audit';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface ExecutivePeriodSummaryProps {
  periodLabel: string;
  viewMode: 'operators' | 'shifts';
  summary: KpiSummary & { shiftsWithAudits?: number };
  topReasonLabel: string | null;
}

export const ExecutivePeriodSummary = ({ periodLabel, viewMode, summary, topReasonLabel }: ExecutivePeriodSummaryProps) => {
  const dimensionText =
    viewMode === 'operators'
      ? `${formatNumber(summary.totalOperators)} operadores`
      : `${formatNumber(summary.shiftsWithAudits ?? 0)} turnos`;
  const verb = viewMode === 'operators' ? 'se analizaron' : 'se asociaron';
  const reasonText = topReasonLabel ? `El motivo de correccion mas frecuente fue ${topReasonLabel}.` : 'No se registraron motivos de correccion en el conjunto filtrado.';

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">Resumen del periodo</h2>
      <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-700">
        Durante {periodLabel} {verb} {formatNumber(summary.totalAudits)} auditorias correspondientes a {dimensionText}. El {formatPercent(summary.validatedRate)} de los casos resulto
        validado y el {formatPercent(summary.noveltyRate)} fue corregido u observado. {reasonText}
      </p>
    </section>
  );
};
