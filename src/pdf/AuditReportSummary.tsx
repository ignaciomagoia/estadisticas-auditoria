import { Text, View } from '@react-pdf/renderer';
import type { AuditReportData } from './audit-report-types';
import { styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const getKpiCards = (report: AuditReportData) => [
  ['Total auditorias', formatNumber(report.kpis.totalAudits)],
  ['Porcentaje validado', formatPercent(report.kpis.validatedRate)],
  ['% corregido u observado', formatPercent(report.kpis.noveltyRate)],
  ['Casos validados', formatNumber(report.kpis.validCount)],
  ['Casos corregidos', formatNumber(report.kpis.correctedCount)],
  ['Casos observados', formatNumber(report.kpis.observedCount)],
  [report.kpis.dimensionLabel, formatNumber(report.kpis.dimensionValue)],
];

export const AuditReportSummary = ({ report }: { report: AuditReportData }) => (
  <>
    <Text style={styles.title}>Informe de Auditorias</Text>
    <Text style={styles.subtitle}>Periodo seleccionado: {report.periodLabel}</Text>
    <Text style={styles.subtitle}>Vista: {report.viewLabel}</Text>
    <Text style={styles.subtitle}>
      Filtros: {report.filtersSummary.length ? report.filtersSummary.join(' | ') : 'Sin filtros aplicados'}
    </Text>

    <View style={styles.cardGrid}>
      {getKpiCards(report).map(([label, value]) => (
        <View key={label} style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{label}</Text>
          <Text style={styles.kpiValue}>{value}</Text>
        </View>
      ))}
    </View>

    <View style={styles.noteBox}>
      <Text style={styles.noteTitle}>Resumen del periodo</Text>
      {report.summaryLines.map((line) => (
        <View key={line} style={styles.bullet}>
          <Text style={styles.bulletDot}>-</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  </>
);
