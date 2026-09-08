import { Page, Text } from '@react-pdf/renderer';
import type { OperatorSummary } from '../types/audit';
import type { AuditReportData, ReportTableColumn, ShiftOperatorTable } from './audit-report-types';
import { AuditReportFooter } from './AuditReportFooter';
import { AuditReportHeader } from './AuditReportHeader';
import { AuditReportTable } from './AuditReportTable';
import { styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const SHIFT_OPERATOR_ROWS_PER_PAGE = 14;

const shiftLabel = (shift: string) => `Turno ${shift}`;

const operatorByShiftColumns: Array<ReportTableColumn<OperatorSummary>> = [
  { key: 'operator', label: 'Operador', width: 25, render: (row) => row.operator },
  { key: 'totalAudits', label: 'Total', width: 9, align: 'right', render: (row) => formatNumber(row.totalAudits) },
  { key: 'validCount', label: 'Validados', width: 10, align: 'right', render: (row) => formatNumber(row.validCount) },
  { key: 'validatedRate', label: '% validado', width: 10, align: 'right', render: (row) => formatPercent(row.validatedRate) },
  { key: 'correctedCount', label: 'Corregidos', width: 10, align: 'right', render: (row) => formatNumber(row.correctedCount) },
  { key: 'observedCount', label: 'Observados', width: 10, align: 'right', render: (row) => formatNumber(row.observedCount) },
  { key: 'noveltyRate', label: '% corr./obs.', width: 11, align: 'right', render: (row) => formatPercent(row.noveltyRate) },
  { key: 'topReason', label: 'Motivo frecuente', width: 15, render: (row) => row.topReason ?? '-' },
];

const chunkRows = <T,>(rows: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
};

const renderShiftOperatorPages = (report: AuditReportData, table: ShiftOperatorTable) => {
  const rowChunks = chunkRows(table.rows, SHIFT_OPERATOR_ROWS_PER_PAGE);

  return rowChunks.map((rows, pageIndex) => {
    const firstRow = pageIndex * SHIFT_OPERATOR_ROWS_PER_PAGE + 1;
    const lastRow = firstRow + rows.length - 1;

    return (
      <Page key={`${table.shift}-${pageIndex}`} size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Resumen de operadores por turno</Text>
        <Text style={styles.sectionSubtitle}>
          {shiftLabel(table.shift)} - operadores {formatNumber(firstRow)} a {formatNumber(lastRow)} de {formatNumber(table.rows.length)}.
        </Text>
        <AuditReportTable columns={operatorByShiftColumns} rows={rows} />
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>
    );
  });
};

export const AuditReportShiftOperatorTables = ({ report }: { report: AuditReportData }) => {
  const tables = report.shiftPages?.operatorTablesByShift ?? [];
  if (tables.length === 0) return null;

  return <>{tables.flatMap((table) => renderShiftOperatorPages(report, table))}</>;
};
