import type { OperatorSummary } from '../../types/audit';
import { getLowestValidationOperators } from '../../services/metricsService';
import { ValidationStackedChart } from './ValidationStackedChart';

interface ValidationRankingSectionProps {
  rankingSummaries: OperatorSummary[];
  minimumAudits: number;
  onMinimumAuditsChange: (value: number) => void;
  isActionFiltered: boolean;
}

const MINIMUM_OPTIONS = [5, 10, 20, 30];

export const ValidationRankingSection = ({ rankingSummaries, minimumAudits, onMinimumAuditsChange, isActionFiltered }: ValidationRankingSectionProps) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Operadores con menor porcentaje de validacion</h2>
        <p className="mt-1 text-sm text-slate-500">Los porcentajes consideran Validado, Corregido y Observado dentro del resto de los filtros seleccionados.</p>
        {isActionFiltered ? <p className="mt-1 text-sm text-amber-700">El filtro de accion no se aplica a este ranking para evitar porcentajes no comparables.</p> : null}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Minimo
        <select
          value={minimumAudits}
          onChange={(event) => onMinimumAuditsChange(Number(event.target.value))}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          {MINIMUM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
    <div className="h-[28rem]">
      <ValidationStackedChart data={getLowestValidationOperators(rankingSummaries, minimumAudits, 15)} />
    </div>
  </section>
);
