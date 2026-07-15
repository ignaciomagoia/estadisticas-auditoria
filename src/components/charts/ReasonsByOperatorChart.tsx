import { Bar } from 'react-chartjs-2';
import type { OperatorReasonRankingItem, ReasonOperatorItem } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';
import { palette } from './chartOptions';

interface ReasonsByOperatorChartProps {
  mode: 'count' | 'reason';
  countData: OperatorReasonRankingItem[];
  reasonData: ReasonOperatorItem[];
}

export const ReasonsByOperatorChart = ({ mode, countData, reasonData }: ReasonsByOperatorChartProps) => {
  if (mode === 'reason') {
    return (
      <Bar
        data={{
          labels: reasonData.map((item) => item.operator),
          datasets: [{ label: 'Cantidad', data: reasonData.map((item) => item.count), backgroundColor: '#2563eb', borderRadius: 6 }],
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
                  const item = reasonData[context.dataIndex];
                  return [
                    `${item.reason}: ${item.count}`,
                    `Total auditorias del operador: ${item.totalAudits}`,
                    `Porcentaje sobre sus auditorias: ${formatPercent(item.percentOfAudits)}`,
                    `Porcentaje sobre sus casos corregidos u observados: ${formatPercent(item.percentOfNovelties)}`,
                  ];
                },
              },
            },
          },
          scales: { x: { grid: { color: '#e2e8f0' } }, y: { grid: { display: false } } },
        }}
      />
    );
  }

  const reasons = Array.from(new Set(countData.flatMap((item) => item.reasons.slice(0, 5).map((reason) => reason.label))));

  return (
    <Bar
      data={{
        labels: countData.map((item) => item.operator),
        datasets: reasons.map((reason, index) => ({
          label: reason,
          data: countData.map((item) => item.reasons.find((entry) => entry.label === reason)?.count ?? 0),
          backgroundColor: palette[index % palette.length],
          borderRadius: 6,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, color: '#475569' } },
          tooltip: { backgroundColor: '#0f172a' },
        },
        scales: { x: { stacked: true, grid: { color: '#e2e8f0' } }, y: { stacked: true, grid: { display: false } } },
      }}
    />
  );
};
