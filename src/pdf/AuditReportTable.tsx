import { Text, View } from '@react-pdf/renderer';
import type { ReportTableColumn } from './audit-report-types';
import { styles } from './audit-report-styles';

interface AuditReportTableProps<T> {
  columns: ReportTableColumn<T>[];
  rows: T[];
  emptyText?: string;
}

const getTextAlign = (align: ReportTableColumn<unknown>['align']) => {
  if (align === 'right') return 'right';
  if (align === 'center') return 'center';
  return 'left';
};

export const AuditReportTable = <T,>({ columns, rows, emptyText = 'Sin datos para mostrar.' }: AuditReportTableProps<T>) => {
  if (rows.length === 0) return <Text style={styles.emptyState}>{emptyText}</Text>;

  return (
    <View style={styles.table}>
      <View fixed style={styles.tableHeader}>
        {columns.map((column) => (
          <Text
            key={String(column.key)}
            style={[
              styles.tableHeaderCell,
              {
                width: `${column.width}%`,
                textAlign: getTextAlign(column.align),
              },
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} wrap={false} style={styles.tableRow}>
          {columns.map((column) => (
            <Text
              key={String(column.key)}
              style={[
                styles.tableCell,
                {
                  width: `${column.width}%`,
                  textAlign: getTextAlign(column.align),
                },
              ]}
            >
              {column.render(row)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
