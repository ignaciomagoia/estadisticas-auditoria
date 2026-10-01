import { Page, Text, View } from '@react-pdf/renderer';
import type { ShiftReasonComparisonItem, ShiftSummary } from '../domain/shift-types';
import type { AuditReportData, AuditReportShiftPages as AuditReportShiftPageData, ReportTableColumn } from './audit-report-types';
import { AuditReportFooter } from './AuditReportFooter';
import { AuditReportHeader } from './AuditReportHeader';
import { AuditReportTable } from './AuditReportTable';
import { AuditReportShiftOperatorTables } from './AuditReportShiftOperatorTables';
import { ChartPanel, CompactReasonTable, CountBarChart, StackedBarChart, type ReportBarItem, type ReportStackedBarItem } from './AuditReportCharts';
import { reportColors, styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const shiftLabel = (shift: string) => `Turno ${shift}`;

const toValidationItems = (rows: ShiftSummary[]): ReportStackedBarItem[] =>
  rows.map((row) => ({
    label: shiftLabel(row.shift),
    valueLabel: formatPercent(row.validatedRate),
    segments: [
      { label: 'Validado', value: row.validCount, widthPercent: row.validatedRate, color: reportColors.teal },
      { label: 'Corregido u observado', value: row.noveltyCount, widthPercent: row.noveltyRate, color: reportColors.amber },
    ],
  }));

const toNoveltyItems = (rows: ShiftSummary[]): ReportStackedBarItem[] => {
  const maxNovelty = Math.max(...rows.map((row) => row.noveltyCount), 1);
  return rows.map((row) => ({
    label: shiftLabel(row.shift),
    valueLabel: formatNumber(row.noveltyCount),
    segments: [
      { label: 'Corregidos', value: row.correctedCount, widthPercent: (row.correctedCount / maxNovelty) * 100, color: reportColors.sky },
      { label: 'Observados', value: row.observedCount, widthPercent: (row.observedCount / maxNovelty) * 100, color: reportColors.red },
    ],
  }));
};

const toReasonItems = (pages: AuditReportShiftPageData): ReportBarItem[] =>
  pages.reasonsBySelectedShift.slice(0, 10).map((reason) => ({
    label: reason.label,
    count: reason.count,
    percent: reason.percentOfNovelties,
  }));

const toShiftReasonItems = (rows: ShiftReasonComparisonItem[]): ReportBarItem[] =>
  rows.map((row) => ({
    label: shiftLabel(row.shift),
    count: row.count,
    percent: row.percentOfAudits,
  }));

const shiftColumns: Array<ReportTableColumn<ShiftSummary>> = [
  { key: 'shift', label: 'Turno', width: 15, render: (row) => shiftLabel(row.shift) },
  { key: 'operatorsCount', label: 'Operadores auditados', width: 18, align: 'right', render: (row) => formatNumber(row.operatorsCount) },
  { key: 'totalAudits', label: 'Total auditorias', width: 13, align: 'right', render: (row) => formatNumber(row.totalAudits) },
  { key: 'validatedRate', label: '% validado', width: 13, align: 'right', render: (row) => formatPercent(row.validatedRate) },
  { key: 'correctedCount', label: 'Corregidos', width: 12, align: 'right', render: (row) => formatNumber(row.correctedCount) },
  { key: 'observedCount', label: 'Observados', width: 12, align: 'right', render: (row) => formatNumber(row.observedCount) },
  { key: 'topReason', label: 'Motivo mas frecuente', width: 17, render: (row) => row.topReason ?? '-' },
];

export const AuditReportShiftPages = ({ report }: { report: AuditReportData }) => {
  const pages = report.shiftPages;
  if (!pages) return null;

  const reasonItems = toReasonItems(pages);
  const shiftReasonItems = toShiftReasonItems(pages.shiftsForReason);
  const isSingleShiftReport = pages.isSingleShiftReport;

  return (
    <>
      {!isSingleShiftReport ? (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <AuditReportHeader periodLabel={report.periodLabel} />
          <Text style={styles.sectionTitle}>Resultados principales</Text>
          <View style={styles.chartGrid}>
            <ChartPanel title="Porcentaje validado por turno">
              <StackedBarChart
                items={toValidationItems(pages.validationByShift)}
                legend={[
                  { label: 'Validado', color: reportColors.teal },
                  { label: 'Corregido u observado', color: reportColors.amber },
                ]}
              />
            </ChartPanel>
            <ChartPanel title="Correcciones y observaciones por turno">
              <StackedBarChart
                items={toNoveltyItems(pages.noveltyVolumeByShift)}
                legend={[
                  { label: 'Corregidos', color: reportColors.sky },
                  { label: 'Observados', color: reportColors.red },
                ]}
              />
            </ChartPanel>
          </View>
          <AuditReportFooter generatedAt={report.generatedAt} />
        </Page>
      ) : null}

      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Motivos de correccion</Text>
        <View style={isSingleShiftReport ? styles.chartColumn : styles.chartGrid}>
          <ChartPanel fullWidth={isSingleShiftReport} title={pages.selectedShift ? `Motivos por ${shiftLabel(pages.selectedShift)}` : 'Motivos por turno'}>
            <CountBarChart items={reasonItems} />
            {!isSingleShiftReport ? <CompactReasonTable items={reasonItems} percentLabel="% novedades" /> : null}
          </ChartPanel>
          {!isSingleShiftReport ? (
            <ChartPanel
              title={pages.selectedReason ? `Comparacion por motivo: ${pages.selectedReason}` : 'Comparacion de turnos por motivo'}
              subtitle="Porcentaje calculado sobre auditorias totales del turno."
            >
              <CountBarChart items={shiftReasonItems} />
              <CompactReasonTable items={shiftReasonItems} percentLabel="% auditorias" />
            </ChartPanel>
          ) : null}
        </View>
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>

      {!isSingleShiftReport ? (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <AuditReportHeader periodLabel={report.periodLabel} />
          <Text style={styles.sectionTitle}>Tabla resumen por turno</Text>
          <Text style={styles.sectionSubtitle}>Incluye las primeras {formatNumber(pages.tableRows.length)} filas segun el orden actual del dashboard.</Text>
          <AuditReportTable columns={shiftColumns} rows={pages.tableRows} />
          <AuditReportFooter generatedAt={report.generatedAt} />
        </Page>
      ) : null}

      <AuditReportShiftOperatorTables report={report} />
    </>
  );
};
