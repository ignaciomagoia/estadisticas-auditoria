import { Page, Text, View } from '@react-pdf/renderer';
import type { OperatorSummary, ReasonOperatorItem } from '../types/audit';
import type { AuditReportData, AuditReportOperatorPages as AuditReportOperatorPageData, ReportTableColumn } from './audit-report-types';
import { AuditReportFooter } from './AuditReportFooter';
import { AuditReportHeader } from './AuditReportHeader';
import { AuditReportTable } from './AuditReportTable';
import { ChartPanel, CompactReasonTable, CountBarChart, StackedBarChart, type ReportBarItem, type ReportStackedBarItem } from './AuditReportCharts';
import { reportColors, styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const toValidationItems = (rows: OperatorSummary[]): ReportStackedBarItem[] =>
  rows.map((row) => ({
    label: row.operator,
    valueLabel: formatPercent(row.validatedRate),
    segments: [
      { label: 'Validado', value: row.validCount, widthPercent: row.validatedRate, color: reportColors.teal },
      { label: 'Corregido u observado', value: row.noveltyCount, widthPercent: row.noveltyRate, color: reportColors.amber },
    ],
  }));

const toNoveltyItems = (rows: OperatorSummary[]): ReportStackedBarItem[] => {
  const maxNovelty = Math.max(...rows.map((row) => row.noveltyCount), 1);
  return rows.map((row) => ({
    label: row.operator,
    valueLabel: formatNumber(row.noveltyCount),
    segments: [
      { label: 'Corregidos', value: row.correctedCount, widthPercent: (row.correctedCount / maxNovelty) * 100, color: reportColors.sky },
      { label: 'Observados', value: row.observedCount, widthPercent: (row.observedCount / maxNovelty) * 100, color: reportColors.red },
    ],
  }));
};

const toReasonItems = (pages: AuditReportOperatorPageData): ReportBarItem[] =>
  pages.topReasons.map((reason) => ({
    label: reason.label,
    count: reason.count,
    percent: reason.percentOfNovelties,
  }));

const toOperatorReasonItems = (rows: ReasonOperatorItem[]): ReportBarItem[] =>
  rows.map((row) => ({
    label: row.operator,
    count: row.count,
    percent: row.percentOfAudits,
  }));

const operatorColumns: Array<ReportTableColumn<OperatorSummary>> = [
  { key: 'operator', label: 'Operador', width: 25, render: (row) => row.operator },
  { key: 'totalAudits', label: 'Total', width: 11, align: 'right', render: (row) => formatNumber(row.totalAudits) },
  { key: 'validatedRate', label: '% validado', width: 12, align: 'right', render: (row) => formatPercent(row.validatedRate) },
  { key: 'correctedCount', label: 'Corregidos', width: 11, align: 'right', render: (row) => formatNumber(row.correctedCount) },
  { key: 'observedCount', label: 'Observados', width: 11, align: 'right', render: (row) => formatNumber(row.observedCount) },
  { key: 'noveltyRate', label: '% corr./obs.', width: 12, align: 'right', render: (row) => formatPercent(row.noveltyRate) },
  { key: 'topReason', label: 'Motivo mas frecuente', width: 18, render: (row) => row.topReason ?? '-' },
];

export const AuditReportOperatorPages = ({ report }: { report: AuditReportData }) => {
  const pages = report.operatorPages;
  if (!pages) return null;

  const reasonItems = toReasonItems(pages);
  const operatorReasonItems = toOperatorReasonItems(pages.operatorsForReason);

  return (
    <>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Resultados principales</Text>
        <Text style={styles.sectionSubtitle}>Se muestran hasta 10 operadores por bloque.</Text>
        <View style={styles.chartGrid}>
          <ChartPanel title="Operadores con menor porcentaje validado" subtitle={`Minimo ${pages.minimumAudits} auditorias.`}>
            <StackedBarChart
              items={toValidationItems(pages.lowestValidation)}
              legend={[
                { label: 'Validado', color: reportColors.teal },
                { label: 'Corregido u observado', color: reportColors.amber },
              ]}
            />
          </ChartPanel>
          <ChartPanel title="Operadores con mas correcciones y observaciones">
            <StackedBarChart
              items={toNoveltyItems(pages.noveltyVolume)}
              legend={[
                { label: 'Corregidos', color: reportColors.sky },
                { label: 'Observados', color: reportColors.red },
              ]}
            />
          </ChartPanel>
        </View>
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Motivos de correccion</Text>
        <View style={styles.chartGrid}>
          <ChartPanel title="Top 10 motivos generales">
            <CountBarChart items={reasonItems} />
            <CompactReasonTable items={reasonItems} percentLabel="% novedades" />
          </ChartPanel>
          <ChartPanel
            title={pages.selectedReason ? `Operadores por motivo: ${pages.selectedReason}` : 'Operadores por motivo'}
            subtitle="Porcentaje calculado sobre auditorias totales del operador."
          >
            <CountBarChart items={operatorReasonItems} />
            <CompactReasonTable items={operatorReasonItems} percentLabel="% auditorias" />
          </ChartPanel>
        </View>
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Tabla resumen por operador</Text>
        <Text style={styles.sectionSubtitle}>Incluye las primeras {formatNumber(pages.tableRows.length)} filas segun el orden actual del dashboard.</Text>
        <AuditReportTable columns={operatorColumns} rows={pages.tableRows} />
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>
    </>
  );
};
