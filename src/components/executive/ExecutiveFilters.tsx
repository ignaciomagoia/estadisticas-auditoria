import { RotateCcw } from 'lucide-react';
import { SHIFT_CODES } from '../../domain/shift-types';
import type { ShiftAuditRecord } from '../../domain/shift-types';
import type { ShiftFilterState } from '../../domain/shift-metrics';
import type { AuditRecord, FilterState } from '../../types/audit';
import { uniqueSorted } from '../../utils/arrays';

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
    >
      <option value="">Todos</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {label === 'Turno' ? `Turno ${option}` : option}
        </option>
      ))}
    </select>
  </label>
);

export const ExecutiveOperatorFilters = ({
  records,
  filters,
  onChange,
  onReset,
}: {
  records: AuditRecord[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}) => {
  const options = {
    operator: uniqueSorted(records.map((record) => record.operator)),
    auditor: uniqueSorted(records.map((record) => record.auditor)),
    affectedSystem: uniqueSorted(records.map((record) => record.affectedSystem)),
    correctionReason: uniqueSorted(records.map((record) => record.correctionReason)),
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <FilterSelect label="Operador" value={filters.operator} options={options.operator} onChange={(operator) => onChange({ ...filters, operator })} />
        <FilterSelect label="Auditor" value={filters.auditor} options={options.auditor} onChange={(auditor) => onChange({ ...filters, auditor })} />
        <FilterSelect
          label="Sistema afectado"
          value={filters.affectedSystem}
          options={options.affectedSystem}
          onChange={(affectedSystem) => onChange({ ...filters, affectedSystem })}
        />
        <FilterSelect
          label="Motivo de correccion"
          value={filters.correctionReason}
          options={options.correctionReason}
          onChange={(correctionReason) => onChange({ ...filters, correctionReason })}
        />
        <button
          type="button"
          onClick={onReset}
          title="Restablecer filtros"
          className="mt-auto inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          Limpiar
        </button>
      </div>
    </section>
  );
};

export const ExecutiveShiftFilters = ({
  records,
  filters,
  onChange,
  onReset,
}: {
  records: ShiftAuditRecord[];
  filters: ShiftFilterState;
  onChange: (filters: ShiftFilterState) => void;
  onReset: () => void;
}) => {
  const options = {
    shift: SHIFT_CODES.filter((shift) => records.some((record) => record.shift === shift)),
    auditor: uniqueSorted(records.map((record) => record.auditor)),
    affectedSystem: uniqueSorted(records.map((record) => record.affectedSystem)),
    correctionReason: uniqueSorted(records.map((record) => record.correctionReason)),
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <FilterSelect label="Turno" value={filters.shift} options={options.shift} onChange={(shift) => onChange({ ...filters, shift })} />
        <FilterSelect label="Auditor" value={filters.auditor} options={options.auditor} onChange={(auditor) => onChange({ ...filters, auditor })} />
        <FilterSelect
          label="Sistema afectado"
          value={filters.affectedSystem}
          options={options.affectedSystem}
          onChange={(affectedSystem) => onChange({ ...filters, affectedSystem })}
        />
        <FilterSelect
          label="Motivo de correccion"
          value={filters.correctionReason}
          options={options.correctionReason}
          onChange={(correctionReason) => onChange({ ...filters, correctionReason })}
        />
        <button
          type="button"
          onClick={onReset}
          title="Restablecer filtros"
          className="mt-auto inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          Limpiar
        </button>
      </div>
    </section>
  );
};
