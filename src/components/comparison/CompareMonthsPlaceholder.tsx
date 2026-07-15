import type { DatasetMeta } from '../../types/audit';

interface CompareMonthsPlaceholderProps {
  periods: DatasetMeta[];
}

export const CompareMonthsPlaceholder = ({ periods }: CompareMonthsPlaceholderProps) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
    <h2 className="text-base font-semibold text-slate-950">Comparar meses</h2>
    {periods.length < 2 ? (
      <p className="mt-2 text-sm">Agrega al menos un segundo archivo para habilitar la comparacion.</p>
    ) : (
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Mes A
          <select className="pdf-hide h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.monthLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Mes B
          <select className="pdf-hide h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900">
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.monthLabel}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-slate-500 md:col-span-2">
          La estructura queda preparada para comparar total de auditorias, porcentaje validado, porcentaje corregido u observado, motivos, operadores y turnos.
        </p>
      </div>
    )}
  </section>
);
