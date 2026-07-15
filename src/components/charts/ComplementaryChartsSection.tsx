import type { AuditRecord } from '../../types/audit';
import { getActionDistribution, getAuditCountByOperator, getAverageDelayByOperator } from '../../services/metricsService';
import { ActionDoughnutChart } from './ActionDoughnutChart';
import { ChartCard } from './ChartCard';
import { VerticalBarChart } from './VerticalBarChart';

interface ComplementaryChartsSectionProps {
  records: AuditRecord[];
  rankingRecords: AuditRecord[];
}

export const ComplementaryChartsSection = ({ records, rankingRecords }: ComplementaryChartsSectionProps) => (
  <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <summary className="cursor-pointer text-base font-semibold text-slate-950">Informacion complementaria</summary>
    <section className="mt-4 grid gap-4 xl:grid-cols-2">
      <ChartCard title="Distribucion por accion tomada" subtitle="Participacion porcentual del conjunto filtrado">
        <ActionDoughnutChart data={getActionDistribution(records)} />
      </ChartCard>
      <ChartCard title="Cantidad de auditorias por operador">
        <VerticalBarChart data={getAuditCountByOperator(records)} valueLabel="Auditorias" />
      </ChartCard>
      <ChartCard title="Demora promedio por operador" subtitle="Valores nulos ignorados">
        <VerticalBarChart data={getAverageDelayByOperator(rankingRecords)} valueLabel="Demora promedio" />
      </ChartCard>
    </section>
  </details>
);
