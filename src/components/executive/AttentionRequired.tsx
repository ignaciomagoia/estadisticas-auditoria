import type { GeneralReasonItem, KpiSummary, OperatorSummary } from '../../types/audit';
import type { ShiftSummary } from '../../domain/shift-types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface AttentionRequiredProps {
  viewMode: 'operators' | 'shifts';
  summary: KpiSummary;
  lowestValidation: OperatorSummary | ShiftSummary | null;
  noveltyVolumeLeader: OperatorSummary | ShiftSummary | null;
  topReason: GeneralReasonItem | { label: string; count: number } | null;
}

const getEntityLabel = (viewMode: 'operators' | 'shifts', item: OperatorSummary | ShiftSummary) =>
  viewMode === 'operators' ? (item as OperatorSummary).operator : `Turno ${(item as ShiftSummary).shift}`;

export const AttentionRequired = ({ viewMode, summary, lowestValidation, noveltyVolumeLeader, topReason }: AttentionRequiredProps) => {
  const lowestText = lowestValidation
    ? `${getEntityLabel(viewMode, lowestValidation)} - ${formatPercent(lowestValidation.validatedRate)} sobre ${formatNumber(lowestValidation.totalAudits)} auditorias.`
    : 'Sin datos suficientes para el minimo configurado.';
  const noveltyText = noveltyVolumeLeader
    ? `${getEntityLabel(viewMode, noveltyVolumeLeader)} - ${formatNumber(noveltyVolumeLeader.noveltyCount)} casos.`
    : 'Sin casos corregidos u observados registrados.';
  const reasonText = topReason ? `${topReason.label} - ${formatNumber(topReason.count)} casos.` : 'Sin motivos registrados.';

  const items = [
    [`Menor porcentaje validado`, lowestText],
    [`Mayor volumen de correcciones y observaciones`, noveltyText],
    [`Motivo mas frecuente`, reasonText],
    [`Casos corregidos`, `${formatNumber(summary.correctedCount)}.`],
    [`Casos observados`, `${formatNumber(summary.observedCount)}.`],
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">Atencion requerida</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {items.map(([label, value]) => (
          <article key={label} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-medium leading-5 text-slate-900">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
