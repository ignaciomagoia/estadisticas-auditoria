import { useMemo, useState } from 'react';
import type { AuditRecord, OperatorSummary } from '../../types/audit';
import { getOperatorMotivesSummary } from '../../services/metricsService';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { ReasonBarChart } from '../charts/ReasonBarChart';

interface OperatorMotivesSectionProps {
  records: AuditRecord[];
  summaries: OperatorSummary[];
}

export const OperatorMotivesSection = ({ records, summaries }: OperatorMotivesSectionProps) => {
  const [operator, setOperator] = useState(summaries[0]?.operator ?? '');
  const selectedOperator = summaries.some((summary) => summary.operator === operator) ? operator : (summaries[0]?.operator ?? '');
  const summary = useMemo(() => getOperatorMotivesSummary(selectedOperator, records), [records, selectedOperator]);

  if (!summary) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Motivos de correccion por operador</h2>
          <p className="mt-1 text-sm text-slate-500">Motivos tomados solo de casos corregidos y observados.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:w-80">
          Operador
          <select
            value={selectedOperator}
            onChange={(event) => setOperator(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {summaries.map((item) => (
              <option key={item.operator} value={item.operator}>
                {item.operator}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{summary.operator}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Total auditorias', formatNumber(summary.totalAudits)],
              ['Validados', formatNumber(summary.validCount)],
              ['Corregidos', formatNumber(summary.correctedCount)],
              ['Observados', formatNumber(summary.observedCount)],
              ['% validado', formatPercent(summary.validatedRate)],
              ['% corregido u observado', formatPercent(summary.noveltyRate)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-1 break-words text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-80 min-h-0">
          <ReasonBarChart data={summary.reasons} />
        </div>
      </div>
    </section>
  );
};
