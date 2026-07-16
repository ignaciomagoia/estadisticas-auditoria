import { Text, View } from '@react-pdf/renderer';
import { styles } from './audit-report-styles';

interface AuditReportHeaderProps {
  periodLabel: string;
}

export const AuditReportHeader = ({ periodLabel }: AuditReportHeaderProps) => (
  <View fixed style={styles.header}>
    <Text style={styles.headerTitle}>Informe de Auditorias</Text>
    <Text style={styles.headerMeta}>Periodo: {periodLabel}</Text>
  </View>
);
