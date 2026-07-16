import { BlobProvider } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AuditReportDocument } from '../../pdf/AuditReportDocument';
import type { AuditReportData, AuditReportPayload } from '../../pdf/audit-report-types';

interface DownloadAuditReportButtonProps {
  report: AuditReportPayload | null;
  fileName: string;
  disabled?: boolean;
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const DownloadAuditReportButton = ({ report, fileName, disabled = false }: DownloadAuditReportButtonProps) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const reportDocumentData: AuditReportData | null = useMemo(
    () => (report ? { ...report, generatedAt: new Date() } : null),
    [report],
  );

  if (!reportDocumentData) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled
          aria-label="Descargar informe PDF"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm opacity-50"
        >
          <Download size={16} />
          Descargar PDF
        </button>
      </div>
    );
  }

  return (
    <BlobProvider document={<AuditReportDocument report={reportDocumentData} />}>
      {({ blob, loading, error }) => {
        const isDisabled = disabled || loading || !blob || Boolean(error);

        return (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                setDownloadError(null);
                if (!blob) {
                  setDownloadError('No se pudo preparar el informe. Intentalo nuevamente.');
                  return;
                }
                downloadBlob(blob, fileName);
              }}
              disabled={isDisabled}
              aria-label="Descargar informe PDF"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              {loading ? 'Generando informe...' : 'Descargar PDF'}
            </button>
            {error || downloadError ? <p className="text-xs text-rose-700">{downloadError ?? 'No se pudo generar el informe PDF.'}</p> : null}
          </div>
        );
      }}
    </BlobProvider>
  );
};
