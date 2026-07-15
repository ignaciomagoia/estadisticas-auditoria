import { Doughnut } from 'react-chartjs-2';
import type { CountItem } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';
import { palette } from './chartOptions';

interface ActionDoughnutChartProps {
  data: CountItem[];
}

export const ActionDoughnutChart = ({ data }: ActionDoughnutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Doughnut
      data={{
        labels: data.map((item) => `${item.label} (${formatPercent(total ? (item.count / total) * 100 : 0)})`),
        datasets: [{ data: data.map((item) => item.count), backgroundColor: palette, borderWidth: 3, borderColor: '#ffffff' }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, color: '#475569' } },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}`,
            },
          },
        },
      }}
    />
  );
};
