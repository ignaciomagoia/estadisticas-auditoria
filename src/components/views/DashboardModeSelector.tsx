export type DashboardDisplayMode = 'executive' | 'detailed';

interface DashboardModeSelectorProps {
  mode: DashboardDisplayMode;
  onChange: (mode: DashboardDisplayMode) => void;
}

export const DashboardModeSelector = ({ mode, onChange }: DashboardModeSelectorProps) => (
  <div className="inline-flex min-w-0 rounded-md border border-slate-200 bg-white p-1 shadow-sm" aria-label="Modo de visualizacion">
    <button
      type="button"
      onClick={() => onChange('executive')}
      className={`rounded px-3 py-2 text-sm font-medium transition ${mode === 'executive' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      Resumen Ejecutivo
    </button>
    <button
      type="button"
      onClick={() => onChange('detailed')}
      className={`rounded px-3 py-2 text-sm font-medium transition ${mode === 'detailed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      Analisis Detallado
    </button>
  </div>
);
