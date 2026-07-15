import type { AuditRecord, OperatorSummary } from '../../types/audit';
import { getGeneralReasonStats, getOperatorsByNoveltyVolume } from '../../services/metricsService';
import { ChartCard } from './ChartCard';
import { NoveltyVolumeChart } from './NoveltyVolumeChart';
import { TopReasonsChart } from './TopReasonsChart';

interface PriorityChartsSectionProps {
  records: AuditRecord[];
  summaries: OperatorSummary[];
}

export const PriorityChartsSection = ({ records, summaries }: PriorityChartsSectionProps) => (
  <section className="pdf-section grid min-w-0 gap-4 xl:grid-cols-2">
    <ChartCard title="Operadores con mas correcciones y observaciones" subtitle="Este grafico muestra volumen absoluto y no porcentaje.">
      <NoveltyVolumeChart data={getOperatorsByNoveltyVolume(summaries, 15)} />
    </ChartCard>
    <ChartCard title="Top 10 motivos de correccion" subtitle="Casos corregidos y observados">
      <TopReasonsChart data={getGeneralReasonStats(records, 10)} />
    </ChartCard>
  </section>
);
