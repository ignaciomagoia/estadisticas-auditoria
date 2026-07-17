import { Text, View } from '@react-pdf/renderer';
import type { AuditReportData } from './audit-report-types';
import { styles } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

const getKpiCards = (report: AuditReportData) => {
  const primaryCards = [
    ['Total auditorias', formatNumber(report.kpis.totalAudits)],
    ['Porcentaje validado', formatPercent(report.kpis.validatedRate)],
    ['% corregido u observado', formatPercent(report.kpis.noveltyRate)],
    [report.kpis.dimensionLabel, formatNumber(report.kpis.dimensionValue)],
  ];

  if (report.reportScope === 'executive') return primaryCards;

  return [
    ...primaryCards.slice(0, 3),
    ['Casos validados', formatNumber(report.kpis.validCount)],
    ['Casos corregidos', formatNumber(report.kpis.correctedCount)],
    ['Casos observados', formatNumber(report.kpis.observedCount)],
    primaryCards[3],
  ];
};

const getEntityLabel = (report: AuditReportData, item: { operator?: string; shift?: string }) =>
  report.viewMode === 'operators' ? (item.operator ?? '-') : `Turno ${item.shift ?? '-'}`;

const getAttentionLines = (report: AuditReportData) => {
  if (report.reportScope !== 'executive') return [];

  const lowestValidation = report.viewMode === 'operators' ? report.operatorPages?.lowestValidation[0] : report.shiftPages?.validationByShift[0];
  const noveltyLeader = report.viewMode === 'operators' ? report.operatorPages?.noveltyVolume[0] : report.shiftPages?.noveltyVolumeByShift[0];
  const topReason = report.viewMode === 'operators' ? report.operatorPages?.topReasons[0] : report.shiftPages?.reasonsBySelectedShift[0];

  return [
    lowestValidation
      ? `Menor porcentaje validado: ${getEntityLabel(report, lowestValidation)} - ${formatPercent(lowestValidation.validatedRate)} sobre ${formatNumber(lowestValidation.totalAudits)} auditorias.`
      : 'Menor porcentaje validado: sin datos suficientes.',
    noveltyLeader
      ? `Mayor volumen de correcciones y observaciones: ${getEntityLabel(report, noveltyLeader)} - ${formatNumber(noveltyLeader.noveltyCount)} casos.`
      : 'Mayor volumen de correcciones y observaciones: sin casos registrados.',
    topReason ? `Motivo mas frecuente: ${topReason.label} - ${formatNumber(topReason.count)} casos.` : 'Motivo mas frecuente: sin motivos registrados.',
    `Casos corregidos: ${formatNumber(report.kpis.correctedCount)}.`,
    `Casos observados: ${formatNumber(report.kpis.observedCount)}.`,
  ];
};

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

    {getAttentionLines(report).length ? (
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Atencion requerida</Text>
        {getAttentionLines(report).map((line) => (
          <View key={line} style={styles.bullet}>
            <Text style={styles.bulletDot}>-</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    ) : null}
  </>
);
