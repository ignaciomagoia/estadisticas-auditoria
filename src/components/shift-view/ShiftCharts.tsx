import { Bar } from 'react-chartjs-2';
import type { ShiftReasonComparisonItem, ShiftReasonItem, ShiftSummary } from '../../domain/shift-types';
import { formatPercent } from '../../utils/formatters';
import { palette } from '../charts/chartOptions';

export const ShiftValidationChart = ({ data }: { data: ShiftSummary[] }) => (
  <Bar
    data={{
      labels: data.map((item) => `Turno ${item.shift}`),
      datasets: [
        { label: 'Validado', data: data.map((item) => Number(item.validatedRate.toFixed(1))), backgroundColor: '#0f766e', borderRadius: 6 },
        { label: 'Corregido u observado', data: data.map((item) => Number(item.noveltyRate.toFixed(1))), backgroundColor: '#f59e0b', borderRadius: 6 },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: (context) => {
              const item = data[context.dataIndex];
              return [
                `Total auditorias: ${item.totalAudits}`,
                `Operadores auditados: ${item.operatorsCount}`,
                `Validados: ${item.validCount}`,
                `Corregidos: ${item.correctedCount}`,
                `Observados: ${item.observedCount}`,
                `% validado: ${formatPercent(item.validatedRate)}`,
                `% corregido u observado: ${formatPercent(item.noveltyRate)}`,
              ];
            },
          },
        },
      },
      scales: { x: { stacked: true, max: 100, ticks: { callback: (value) => `${value}%` } }, y: { stacked: true, grid: { display: false } } },
    }}
  />
);

export const ShiftNoveltyVolumeChart = ({ data }: { data: ShiftSummary[] }) => (
  <Bar
    data={{
      labels: data.map((item) => `Turno ${item.shift}`),
      datasets: [
        { label: 'Corregidos', data: data.map((item) => item.correctedCount), backgroundColor: '#2563eb', borderRadius: 6 },
        { label: 'Observados', data: data.map((item) => item.observedCount), backgroundColor: '#dc2626', borderRadius: 6 },
      ],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: (context) => {
              const item = data[context.dataIndex];
              return [`Total auditorias: ${item.totalAudits}`, `Validados: ${item.validCount}`, `Corregidos: ${item.correctedCount}`, `Observados: ${item.observedCount}`];
            },
          },
        },
      },
      scales: { x: { grid: { display: false } }, y: { grid: { color: '#e2e8f0' } } },
    }}
  />
);

export const ShiftReasonsChart = ({ data }: { data: ShiftReasonItem[] }) => (
  <Bar
    data={{
      labels: data.map((item) => item.label),
      datasets: [{ data: data.map((item) => item.count), backgroundColor: data.map((item) => (item.isMissing ? '#f59e0b' : '#2563eb')), borderRadius: 6, barThickness: 18 }],
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
              return [`Cantidad: ${item.count}`, `${formatPercent(item.percentOfAudits)} sobre auditorias del turno`, `${formatPercent(item.percentOfNovelties)} sobre corregidos u observados`, `${item.operatorsCount} operadores`];
            },
          },
        },
      },
      scales: { x: { grid: { color: '#e2e8f0' } }, y: { grid: { display: false } } },
    }}
  />
);

export const ShiftsForReasonChart = ({ data }: { data: ShiftReasonComparisonItem[] }) => (
  <Bar
    data={{
      labels: data.map((item) => `Turno ${item.shift}`),
      datasets: [{ label: 'Cantidad', data: data.map((item) => item.count), backgroundColor: palette[1], borderRadius: 6 }],
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: (context) => {
              const item = data[context.dataIndex];
              return [`${item.reason}: ${item.count}`, `Total auditorias: ${item.totalAudits}`, `${formatPercent(item.percentOfAudits)} sobre auditorias`, `${formatPercent(item.percentOfNovelties)} sobre corregidos u observados`];
            },
          },
        },
      },
      scales: { x: { grid: { display: false } }, y: { grid: { color: '#e2e8f0' } } },
    }}
  />
);
