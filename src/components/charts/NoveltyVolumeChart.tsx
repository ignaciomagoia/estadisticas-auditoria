import { Bar } from 'react-chartjs-2';
import type { OperatorSummary } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';

interface NoveltyVolumeChartProps {
  data: OperatorSummary[];
}

export const NoveltyVolumeChart = ({ data }: NoveltyVolumeChartProps) => (
  <Bar
    data={{
      labels: data.map((item) => item.operator),
      datasets: [
        {
          label: 'Corregidos',
          data: data.map((item) => item.correctedCount),
          backgroundColor: '#2563eb',
          borderRadius: 6,
        },
        {
          label: 'Observados',
          data: data.map((item) => item.observedCount),
          backgroundColor: '#dc2626',
          borderRadius: 6,
        },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#475569' } },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          callbacks: {
            title: ([context]) => data[context.dataIndex]?.operator ?? '',
            label: (context) => {
              const item = data[context.dataIndex];
              return [
                `Total auditado: ${item.totalAudits}`,
                `Validados: ${item.validCount}`,
                `Corregidos: ${item.correctedCount}`,
                `Observados: ${item.observedCount}`,
                `Total corregidos u observados: ${item.noveltyCount}`,
                `% validado: ${formatPercent(item.validatedRate)}`,
                `% corregido u observado: ${formatPercent(item.noveltyRate)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: { stacked: true, grid: { color: '#e2e8f0' }, ticks: { color: '#475569' } },
        y: { stacked: true, grid: { display: false }, ticks: { color: '#475569' } },
      },
    }}
  />
);
