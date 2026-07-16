import { Text, View } from '@react-pdf/renderer';
import { styles } from './audit-report-styles';
import { formatDate } from '../utils/formatters';

interface AuditReportFooterProps {
  generatedAt: Date;
}

export const AuditReportFooter = ({ generatedAt }: AuditReportFooterProps) => (
  <View fixed style={styles.footer}>
    <Text>Generado: {formatDate(generatedAt)}</Text>
    <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`} />
  </View>
);
