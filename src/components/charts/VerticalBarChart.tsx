import { Bar } from 'react-chartjs-2';
import type { CountItem } from '../../types/audit';
import { palette } from './chartOptions';

interface VerticalBarChartProps {
  data: CountItem[];
  valueLabel?: string;
}

export const VerticalBarChart = ({ data, valueLabel = 'Cantidad' }: VerticalBarChartProps) => (
  <Bar
    data={{
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.count),
          backgroundColor: data.map((_, index) => palette[index % palette.length]),
          borderRadius: 6,
          barThickness: 22,
        },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: { label: (context) => `${valueLabel}: ${context.parsed.y}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', maxRotation: 35, minRotation: 0 } },
        y: { grid: { color: '#e2e8f0' }, ticks: { color: '#475569' } },
      },
    }}
  />
);
