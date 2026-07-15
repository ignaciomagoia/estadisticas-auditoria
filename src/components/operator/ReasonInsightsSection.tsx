import { useMemo, useState } from 'react';
import type { AuditRecord, OperatorSummary } from '../../types/audit';
import { getAllReasons, getOperatorReasonRankings, getOperatorsForReason } from '../../services/metricsService';
import { ReasonsByOperatorChart } from '../charts/ReasonsByOperatorChart';

interface ReasonInsightsSectionProps {
  records: AuditRecord[];
  summaries: OperatorSummary[];
}

const ALL_REASONS = 'Todos los motivos';

export const ReasonInsightsSection = ({ records, summaries }: ReasonInsightsSectionProps) => {
  const reasons = useMemo(() => getAllReasons(records), [records]);
  const [reason, setReason] = useState(ALL_REASONS);
  const selectedReason = reason === ALL_REASONS || reasons.includes(reason) ? reason : ALL_REASONS;
  const countData = useMemo(() => getOperatorReasonRankings(summaries, records, 10), [records, summaries]);
  const reasonData = useMemo(
    () => (selectedReason === ALL_REASONS ? [] : getOperatorsForReason(selectedReason, records, summaries).slice(0, 15)),
    [records, selectedReason, summaries],
  );

  if (reasons.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Operadores por motivo de correccion</h2>
          <p className="mt-1 text-sm text-slate-500">Selecciona un motivo para ver que operadores acumulan mas casos. "Todos los motivos" muestra barras segmentadas.</p>
        </div>
        <select
          value={selectedReason}
          onChange={(event) => setReason(event.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-80"
        >
          <option value={ALL_REASONS}>{ALL_REASONS}</option>
          {reasons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="h-[28rem]">
        <ReasonsByOperatorChart mode={selectedReason === ALL_REASONS ? 'count' : 'reason'} countData={countData} reasonData={reasonData} />
      </div>
    </section>
  );
};
