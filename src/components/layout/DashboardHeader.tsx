import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DatasetMeta } from '../../types/audit';

interface DashboardHeaderProps {
  meta: DatasetMeta | null;
  periods: DatasetMeta[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
  viewMode: 'operators' | 'shifts';
  onViewModeChange: (mode: 'operators' | 'shifts') => void;
  analysisMode: 'monthly' | 'compare';
  onAnalysisModeChange: (mode: 'monthly' | 'compare') => void;
  isShiftViewDisabled?: boolean;
  exportButton?: ReactNode;
}

export const DashboardHeader = ({
  meta,
  periods,
  selectedPeriodId,
  onPeriodChange,
  viewMode,
  onViewModeChange,
  analysisMode,
  onAnalysisModeChange,
  isShiftViewDisabled = false,
  exportButton,
}: DashboardHeaderProps) => (
  <header className="flex min-w-0 flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
    <div className="min-w-0">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Business Intelligence</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Dashboard Auditorias</h1>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
          <CalendarDays size={16} />
          {meta?.monthLabel ?? 'Periodo no seleccionado'}
        </span>
      </div>
    </div>
    <div className="flex min-w-0 flex-col gap-3 lg:items-end">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Periodo
        <select
          value={selectedPeriodId}
          onChange={(event) => onPeriodChange(event.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.monthLabel}
            </option>
          ))}
        </select>
      </label>
      <div className="flex min-w-0 flex-wrap gap-2">
        <div className="inline-flex min-w-0 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onAnalysisModeChange('monthly')}
            className={`rounded px-3 py-2 text-sm font-medium transition ${analysisMode === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Vista mensual
          </button>
          <button
            type="button"
            onClick={() => onAnalysisModeChange('compare')}
            disabled={periods.length < 2}
            title={periods.length < 2 ? 'Agrega al menos un segundo archivo para habilitar la comparacion.' : undefined}
            className={`rounded px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${analysisMode === 'compare' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Comparar meses
          </button>
        </div>
        <div className="inline-flex min-w-0 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('operators')}
            className={`rounded px-3 py-2 text-sm font-medium transition ${viewMode === 'operators' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Por operadores
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('shifts')}
            disabled={isShiftViewDisabled}
            title={isShiftViewDisabled ? 'La nomina por turno no esta disponible' : undefined}
            className={`rounded px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${viewMode === 'shifts' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Por turnos
          </button>
        </div>
      </div>
      {exportButton}
    </div>
  </header>
);
