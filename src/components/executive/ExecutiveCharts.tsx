import type { ReactNode } from 'react';
import type { GeneralReasonItem, OperatorSummary } from '../../types/audit';
import type { ShiftReasonItem, ShiftSummary } from '../../domain/shift-types';
import { ShiftReasonsChart, ShiftValidationChart } from '../shift-view/ShiftCharts';
import { TopReasonsChart } from '../charts/TopReasonsChart';
import { ValidationStackedChart } from '../charts/ValidationStackedChart';

const ExecutiveChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
    <div className="h-72 min-w-0">{children}</div>
  </article>
);

export const ExecutiveOperatorCharts = ({
  validationData,
  topReasons,
  onSelectOperator,
}: {
  validationData: OperatorSummary[];
  topReasons: GeneralReasonItem[];
  onSelectOperator: (operator: string) => void;
}) => (
  <section className="grid min-w-0 gap-4 xl:grid-cols-2">
    <ExecutiveChartCard title="Operadores con menor porcentaje de validacion" subtitle="Hasta 10 operadores con el minimo de auditorias configurado.">
      <ValidationStackedChart data={validationData} onItemClick={(summary) => onSelectOperator(summary.operator)} />
    </ExecutiveChartCard>
    <ExecutiveChartCard title="Motivos de correccion mas frecuentes" subtitle="Casos corregidos y observados.">
      <TopReasonsChart data={topReasons} />
    </ExecutiveChartCard>
  </section>
);

export const ExecutiveShiftCharts = ({
  validationData,
  reasonData,
  selectedShiftLabel,
  onSelectShift,
}: {
  validationData: ShiftSummary[];
  reasonData: ShiftReasonItem[];
  selectedShiftLabel: string;
  onSelectShift: (shift: string) => void;
}) => (
  <section className="grid min-w-0 gap-4 xl:grid-cols-2">
    <ExecutiveChartCard title="Porcentaje de validacion por turno">
      <ShiftValidationChart data={validationData} onShiftClick={(summary) => onSelectShift(summary.shift)} />
    </ExecutiveChartCard>
    <ExecutiveChartCard title={`Motivos de correccion ${selectedShiftLabel}`} subtitle="Incluye solo casos corregidos y observados.">
      <ShiftReasonsChart data={reasonData} />
    </ExecutiveChartCard>
  </section>
);
