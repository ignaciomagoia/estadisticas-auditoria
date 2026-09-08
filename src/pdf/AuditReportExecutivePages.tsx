import { Page, Text, View } from '@react-pdf/renderer';
import type { OperatorSummary } from '../types/audit';
import type { ShiftSummary } from '../domain/shift-types';
import type { AuditReportData, ReportTableColumn } from './audit-report-types';
import { AuditReportFooter } from './AuditReportFooter';
import { AuditReportHeader } from './AuditReportHeader';
import { AuditReportTable } from './AuditReportTable';
import { AuditReportShiftOperatorTables } from './AuditReportShiftOperatorTables';
import { ChartPanel, CompactReasonTable, CountBarChart, StackedBarChart, type ReportBarItem, type ReportStackedBarItem } from './AuditReportCharts';
import { reportColors, styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const toOperatorValidationItems = (rows: OperatorSummary[]): ReportStackedBarItem[] =>
  rows.slice(0, 10).map((row) => ({
    label: row.operator,
    valueLabel: formatPercent(row.validatedRate),
    segments: [
      { label: 'Validado', value: row.validCount, widthPercent: row.validatedRate, color: reportColors.teal },
      { label: 'Corregido u observado', value: row.noveltyCount, widthPercent: row.noveltyRate, color: reportColors.amber },
    ],
  }));

const toShiftValidationItems = (rows: ShiftSummary[]): ReportStackedBarItem[] =>
  rows.map((row) => ({
    label: `Turno ${row.shift}`,
    valueLabel: formatPercent(row.validatedRate),
    segments: [
      { label: 'Validado', value: row.validCount, widthPercent: row.validatedRate, color: reportColors.teal },
      { label: 'Corregido u observado', value: row.noveltyCount, widthPercent: row.noveltyRate, color: reportColors.amber },
    ],
  }));

const operatorReasonItems = (report: AuditReportData): ReportBarItem[] =>
  (report.operatorPages?.topReasons ?? []).slice(0, 10).map((reason) => ({
    label: reason.label,
    count: reason.count,
    percent: reason.percentOfNovelties,
  }));

const shiftReasonItems = (report: AuditReportData): ReportBarItem[] =>
  (report.shiftPages?.reasonsBySelectedShift ?? []).slice(0, 10).map((reason) => ({
    label: reason.label,
    count: reason.count,
    percent: reason.percentOfNovelties,
  }));

const operatorColumns: Array<ReportTableColumn<OperatorSummary>> = [
  { key: 'operator', label: 'Operador', width: 28, render: (row) => row.operator },
  { key: 'totalAudits', label: 'Total', width: 12, align: 'right', render: (row) => formatNumber(row.totalAudits) },
  { key: 'validatedRate', label: '% validado', width: 13, align: 'right', render: (row) => formatPercent(row.validatedRate) },
  { key: 'correctedCount', label: 'Corregidos', width: 12, align: 'right', render: (row) => formatNumber(row.correctedCount) },
  { key: 'observedCount', label: 'Observados', width: 12, align: 'right', render: (row) => formatNumber(row.observedCount) },
  { key: 'topReason', label: 'Motivo mas frecuente', width: 23, render: (row) => row.topReason ?? '-' },
];

const shiftColumns: Array<ReportTableColumn<ShiftSummary>> = [
  { key: 'shift', label: 'Turno', width: 14, render: (row) => `Turno ${row.shift}` },
  { key: 'operatorsCount', label: 'Operadores auditados', width: 18, align: 'right', render: (row) => formatNumber(row.operatorsCount) },
  { key: 'totalAudits', label: 'Total', width: 13, align: 'right', render: (row) => formatNumber(row.totalAudits) },
  { key: 'validatedRate', label: '% validado', width: 13, align: 'right', render: (row) => formatPercent(row.validatedRate) },
  { key: 'correctedCount', label: 'Corregidos', width: 12, align: 'right', render: (row) => formatNumber(row.correctedCount) },
  { key: 'observedCount', label: 'Observados', width: 12, align: 'right', render: (row) => formatNumber(row.observedCount) },
  { key: 'topReason', label: 'Motivo mas frecuente', width: 18, render: (row) => row.topReason ?? '-' },
];

export const AuditReportExecutivePages = ({ report }: { report: AuditReportData }) => {
  const isOperatorReport = report.viewMode === 'operators';
  const reasonItems = isOperatorReport ? operatorReasonItems(report) : shiftReasonItems(report);

  return (
    <>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>Resultados principales</Text>
        <View style={styles.chartGrid}>
          <ChartPanel title={isOperatorReport ? 'Operadores con menor porcentaje validado' : 'Porcentaje validado por turno'}>
            <StackedBarChart
              items={isOperatorReport ? toOperatorValidationItems(report.operatorPages?.lowestValidation ?? []) : toShiftValidationItems(report.shiftPages?.validationByShift ?? [])}
              legend={[
                { label: 'Validado', color: reportColors.teal },
                { label: 'Corregido u observado', color: reportColors.amber },
              ]}
            />
          </ChartPanel>
          <ChartPanel title={isOperatorReport ? 'Motivos de correccion mas frecuentes' : `Motivos de correccion ${report.shiftPages?.selectedShift ? `del Turno ${report.shiftPages.selectedShift}` : ''}`}>
            <CountBarChart items={reasonItems} />
            <CompactReasonTable items={reasonItems} percentLabel="% novedades" />
          </ChartPanel>
        </View>
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        <AuditReportHeader periodLabel={report.periodLabel} />
        <Text style={styles.sectionTitle}>{isOperatorReport ? 'Tabla resumen por operador' : 'Tabla resumen por turno'}</Text>
        <Text style={styles.sectionSubtitle}>{isOperatorReport ? 'Incluye las primeras 10 filas de la vista ejecutiva.' : 'Incluye todos los turnos disponibles.'}</Text>
        {isOperatorReport ? (
          <AuditReportTable columns={operatorColumns} rows={(report.operatorPages?.tableRows ?? []).slice(0, 10)} />
        ) : (
          <AuditReportTable columns={shiftColumns} rows={report.shiftPages?.tableRows ?? []} />
        )}
        <AuditReportFooter generatedAt={report.generatedAt} />
      </Page>

      {!isOperatorReport ? <AuditReportShiftOperatorTables report={report} /> : null}
    </>
  );
};
