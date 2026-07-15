import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { CountItem, OperatorNoveltyRate } from '../../types/audit';
import { formatPercent } from '../../utils/formatters';
import { baseBarOptions, palette } from './chartOptions';

type HorizontalBarChartProps =
  | {
      type?: 'count';
      data: CountItem[];
      valueLabel?: string;
    }
  | {
      type: 'noveltyRate';
      data: OperatorNoveltyRate[];
      valueLabel?: string;
    };

export const HorizontalBarChart = (props: HorizontalBarChartProps) => {
  const labels = props.data.map((item) => ('operator' in item ? item.operator : item.label));
  const values = props.data.map((item) => ('noveltyRate' in item ? Number(item.noveltyRate.toFixed(1)) : item.count));

  const options: ChartOptions<'bar'> = {
    ...baseBarOptions,
    plugins: {
      ...baseBarOptions.plugins,
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        callbacks:
          props.type === 'noveltyRate'
            ? {
                title: ([context]) => labels[context.dataIndex],
                label: (context) => {
                  const item = props.data[context.dataIndex] as OperatorNoveltyRate;
                  return [`Auditorias: ${item.totalAudits}`, `Corregidos u observados: ${item.noveltyCount}`, `% corregido u observado: ${formatPercent(item.noveltyRate)}`];
                },
              }
            : {
                label: (context) => `${props.valueLabel ?? 'Cantidad'}: ${context.parsed.x}`,
              },
      },
    },
  };

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, index) => palette[index % palette.length]),
            borderRadius: 6,
            barThickness: 18,
          },
        ],
      }}
      options={options}
    />
  );
};
