import { Document, Page } from '@react-pdf/renderer';
import type { AuditReportData } from './audit-report-types';
import { AuditReportFooter } from './AuditReportFooter';
import { AuditReportHeader } from './AuditReportHeader';
import { AuditReportOperatorPages } from './AuditReportOperatorPages';
import { AuditReportShiftPages } from './AuditReportShiftPages';
import { AuditReportSummary } from './AuditReportSummary';
import { styles } from './audit-report-styles';

interface AuditReportDocumentProps {
  report: AuditReportData;
}

export const AuditReportDocument = ({ report }: AuditReportDocumentProps) => (
  <Document title={`Informe de Auditorias - ${report.periodLabel}`} author="Dashboard Auditorias">
    <Page size="A4" orientation="landscape" style={styles.page}>
      <AuditReportHeader periodLabel={report.periodLabel} />
      <AuditReportSummary report={report} />
      <AuditReportFooter generatedAt={report.generatedAt} />
    </Page>

    {report.viewMode === 'operators' ? <AuditReportOperatorPages report={report} /> : <AuditReportShiftPages report={report} />}
  </Document>
);
