import { Bar } from 'react-chartjs-2';
import type { OperatorSummary } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';

interface ValidationStackedChartProps {
  data: OperatorSummary[];
}

export const ValidationStackedChart = ({ data }: ValidationStackedChartProps) => (
  <Bar
    data={{
      labels: data.map((item) => item.operator),
      datasets: [
        {
          label: 'Validado',
          data: data.map((item) => Number(item.validatedRate.toFixed(1))),
          backgroundColor: '#0f766e',
          borderRadius: 6,
        },
        {
          label: 'Corregido u observado',
          data: data.map((item) => Number(item.noveltyRate.toFixed(1))),
          backgroundColor: '#f59e0b',
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
                `Total de auditorias: ${item.totalAudits}`,
                `Validados: ${item.validCount}`,
                `Corregidos: ${item.correctedCount}`,
                `Observados: ${item.observedCount}`,
                `Porcentaje validado: ${formatPercent(item.validatedRate)}`,
                `% corregido u observado: ${formatPercent(item.noveltyRate)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: { stacked: true, max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#475569', callback: (value) => `${value}%` } },
        y: { stacked: true, grid: { display: false }, ticks: { color: '#475569' } },
      },
    }}
  />
);
