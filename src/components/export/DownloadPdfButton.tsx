import { Download } from 'lucide-react';
import type { RefObject } from 'react';
import { useState } from 'react';
import { exportDashboardToPdf } from '../../services/pdf-export-service';

interface DownloadPdfButtonProps {
  targetRef: RefObject<HTMLElement | null>;
  periodLabel: string;
  viewLabel: string;
  filtersSummary: string[];
  fileName: string;
  disabled?: boolean;
}

export const DownloadPdfButton = ({ targetRef, periodLabel, viewLabel, filtersSummary, fileName, disabled = false }: DownloadPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!targetRef.current || isGenerating) return;
    setError(null);
    setIsGenerating(true);
    try {
      await exportDashboardToPdf({
        rootElement: targetRef.current,
        periodLabel,
        viewLabel,
        filtersSummary,
        fileName,
      });
    } catch (error) {
      console.error('Error al generar PDF', error);
      setError('No se pudo generar el PDF. Intentalo nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || isGenerating}
        aria-label="Descargar la vista actual como PDF"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={16} />
        {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
};
