import type { ChartOptions } from 'chart.js';

export const palette = ['#0f766e', '#2563eb', '#f59e0b', '#64748b', '#7c3aed', '#dc2626', '#0891b2', '#65a30d'];

export const baseBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { color: '#e2e8f0' }, ticks: { color: '#475569' } },
    y: { grid: { display: false }, ticks: { color: '#475569' } },
  },
};
