import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { AuditRecord, OperatorSummary } from '../../types/audit';
import { getActionDistribution, getReasonCounts, isNovelty } from '../../services/metricsService';
import { uniqueSorted } from '../../utils/arrays';
import { formatDate, formatDecimal, formatNumber, formatPercent } from '../../utils/formatters';
import { palette } from '../charts/chartOptions';
import { ReasonBarChart } from '../charts/ReasonBarChart';

interface OperatorPanelProps {
  operator: string | null;
  records: AuditRecord[];
  summary: OperatorSummary | null;
  onClose: () => void;
}

interface LocalFilters {
  action: string;
  reason: string;
  system: string;
}

const EMPTY_LOCAL_FILTERS: LocalFilters = { action: '', reason: '', system: '' };

const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 120;
  return (
    <div className="max-w-md whitespace-pre-line text-slate-600">
      <p className={expanded ? '' : 'line-clamp-3'}>{text}</p>
      {isLong ? (
        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-xs font-medium text-sky-700">
          {expanded ? 'Ver menos' : 'Ver mas'}
        </button>
      ) : null}
    </div>
  );
};

export const OperatorPanel = ({ operator, records, summary, onClose }: OperatorPanelProps) => {
  const [query, setQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<LocalFilters>(EMPTY_LOCAL_FILTERS);

  const operatorRecords = useMemo(() => {
    if (!operator) return [];
    return records.filter((record) => record.operator === operator).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [operator, records]);

  const noveltyRecords = useMemo(() => operatorRecords.filter(isNovelty), [operatorRecords]);
  const filteredNoveltyRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-AR');
    return noveltyRecords.filter((record) => {
      if (localFilters.action && record.action !== localFilters.action) return false;
      if (localFilters.reason && (record.correctionReason ?? 'Sin motivo informado') !== localFilters.reason) return false;
      if (localFilters.system && record.affectedSystem !== localFilters.system) return false;
      if (!normalizedQuery) return true;
      return [record.eventId, record.correctionReason, record.additionalNotes, record.auditor].some((value) => String(value ?? '').toLocaleLowerCase('es-AR').includes(normalizedQuery));
    });
  }, [localFilters, noveltyRecords, query]);

  if (!operator || !summary) return null;

  const reasons = getReasonCounts(operatorRecords);
  const actions = getActionDistribution(operatorRecords);
  const actionOptions = ['Corregido', 'Observado'];
  const reasonOptions = uniqueSorted(noveltyRecords.map((record) => record.correctionReason ?? 'Sin motivo informado'));
  const systemOptions = uniqueSorted(noveltyRecords.map((record) => record.affectedSystem));

  return (
    <div className="pdf-hide fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm" role="dialog" aria-modal="true">
      <aside className="ml-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Panel del operador</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{operator}</h2>
          </div>
          <button type="button" onClick={onClose} title="Cerrar panel" className="rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Total auditorias', formatNumber(summary.totalAudits)],
              ['Validados', formatNumber(summary.validCount)],
              ['% validado', formatPercent(summary.validatedRate)],
              ['Corregidos', formatNumber(summary.correctedCount)],
              ['Observados', formatNumber(summary.observedCount)],
              ['% corregido u observado', formatPercent(summary.noveltyRate)],
              ['Demora prom.', formatDecimal(summary.averageDelay)],
              ['Motivo frecuente', summary.topReason ?? '-'],
              ['Concentracion del motivo principal', summary.topReasonCount ? formatPercent(summary.topReasonConcentrationRate) : '-'],
            ].map(([label, value]) => (
              <div key={label} title={label === 'Concentracion del motivo principal' ? 'Indica que proporcion de los casos corregidos u observados corresponde al motivo mas frecuente del operador.' : undefined} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-1 break-words text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-950">Distribucion porcentual</h3>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: actions.map((item) => item.label),
                    datasets: [{ data: actions.map((item) => item.count), backgroundColor: palette, borderColor: '#ffffff', borderWidth: 2 }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-950">Motivos del operador</h3>
              <div className="h-64">
                <ReasonBarChart data={reasons} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-950">Detalle de correcciones y observaciones</h3>
              <p className="text-sm text-slate-500">Incluye solo casos corregidos y observados. Las observaciones se muestran sin modificar.</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_repeat(3,12rem)]">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por ID, motivo, observacion o auditor"
                    className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <select value={localFilters.action} onChange={(event) => setLocalFilters({ ...localFilters, action: event.target.value })} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">Accion</option>
                  {actionOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <select value={localFilters.reason} onChange={(event) => setLocalFilters({ ...localFilters, reason: event.target.value })} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">Motivo</option>
                  {reasonOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                <select value={localFilters.system} onChange={(event) => setLocalFilters({ ...localFilters, system: event.target.value })} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">Sistema</option>
                  {systemOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">ID evento</th>
                    <th className="px-4 py-3">Auditor</th>
                    <th className="px-4 py-3">Accion tomada</th>
                    <th className="px-4 py-3">Sistema afectado</th>
                    <th className="px-4 py-3">Motivo de correccion</th>
                    <th className="px-4 py-3">Observaciones adicionales</th>
                    <th className="px-4 py-3">Demora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNoveltyRecords.map((record) => (
                    <tr key={`${record.eventId}-${record.date.toISOString()}`}>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(record.date)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{record.eventId}</td>
                      <td className="whitespace-nowrap px-4 py-3">{record.auditor}</td>
                      <td className="whitespace-nowrap px-4 py-3">{record.action}</td>
                      <td className="whitespace-nowrap px-4 py-3">{record.affectedSystem ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{record.correctionReason ?? 'Sin motivo informado'}</td>
                      <td className="px-4 py-3"><ExpandableText text={record.additionalNotes ?? 'Sin observacion adicional'} /></td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDecimal(record.delaySae)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
