import { Bar } from 'react-chartjs-2';
import type { OperatorReasonItem } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';

interface ReasonBarChartProps {
  data: OperatorReasonItem[];
}

export const ReasonBarChart = ({ data }: ReasonBarChartProps) => (
  <Bar
    data={{
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.count),
          backgroundColor: data.map((item) => (item.isMissing ? '#f59e0b' : '#2563eb')),
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: (context) => {
              const item = data[context.dataIndex];
              return [`${item.count} casos`, `${formatPercent(item.percentOfNovelties)} de sus casos corregidos u observados`];
            },
          },
        },
      },
      scales: {
        x: { grid: { color: '#e2e8f0' }, ticks: { color: '#475569' } },
        y: { grid: { display: false }, ticks: { color: '#475569' } },
      },
    }}
  />
);
