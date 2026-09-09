import { Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { styles, reportColors } from './audit-report-styles';
import { formatNumber, formatPercent } from '../utils/formatters';

export interface ReportBarItem {
  label: string;
  count: number;
  percent?: number;
}

export interface ReportStackedBarSegment {
  label: string;
  value: number;
  widthPercent: number;
  color: string;
}

export interface ReportStackedBarItem {
  label: string;
  valueLabel: string;
  segments: ReportStackedBarSegment[];
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const Legend = ({ segments }: { segments: Array<{ label: string; color: string }> }) => (
  <View style={[styles.row, { marginBottom: 8 }]}>
    {segments.map((segment) => (
      <View key={segment.label} style={[styles.row, { alignItems: 'center', marginRight: 12 }]}>
        <View style={{ width: 7, height: 7, backgroundColor: segment.color, marginRight: 4 }} />
        <Text style={{ fontSize: 7, color: reportColors.muted }}>{segment.label}</Text>
      </View>
    ))}
  </View>
);

export const StackedBarChart = ({
  items,
  legend,
}: {
  items: ReportStackedBarItem[];
  legend: Array<{ label: string; color: string }>;
}) => {
  if (items.length === 0) return <Text style={styles.emptyState}>Sin datos suficientes para mostrar.</Text>;

  return (
    <>
      <Legend segments={legend} />
      {items.map((item) => (
        <View key={item.label} style={styles.chartRow} wrap={false}>
          <Text style={styles.chartLabel}>{item.label}</Text>
          <View style={styles.chartBarTrack}>
            {item.segments.map((segment) => (
              <View
                key={segment.label}
                style={{
                  width: `${clampPercent(segment.widthPercent)}%`,
                  height: 9,
                  backgroundColor: segment.color,
                }}
              />
            ))}
          </View>
          <Text style={styles.chartValue}>{item.valueLabel}</Text>
        </View>
      ))}
    </>
  );
};

export const CountBarChart = ({ items }: { items: ReportBarItem[] }) => {
  if (items.length === 0) return <Text style={styles.emptyState}>Sin datos suficientes para mostrar.</Text>;

  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <>
      {items.map((item) => (
        <View key={item.label} style={styles.chartRow} wrap={false}>
          <Text style={styles.chartLabel}>{item.label}</Text>
          <View style={styles.chartBarTrack}>
            <View
              style={{
                width: `${clampPercent((item.count / maxCount) * 100)}%`,
                height: 9,
                backgroundColor: reportColors.blue,
              }}
            />
          </View>
          <Text style={styles.chartValue}>{formatNumber(item.count)}</Text>
        </View>
      ))}
    </>
  );
};

export const CompactReasonTable = ({ items, percentLabel = '%' }: { items: ReportBarItem[]; percentLabel?: string }) => {
  const rows = items.slice(0, 6);
  if (rows.length === 0) return null;

  return (
    <View style={styles.compactTable}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { width: '58%' }]}>Nombre</Text>
        <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Cantidad</Text>
        <Text style={[styles.tableHeaderCell, { width: '22%', textAlign: 'right' }]}>{percentLabel}</Text>
      </View>
      {rows.map((item) => (
        <View key={item.label} style={styles.tableRow} wrap={false}>
          <Text style={[styles.tableCell, { width: '58%' }]}>{item.label}</Text>
          <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatNumber(item.count)}</Text>
          <Text style={[styles.tableCell, { width: '22%', textAlign: 'right' }]}>{item.percent === undefined ? '-' : formatPercent(item.percent)}</Text>
        </View>
      ))}
    </View>
  );
};

export const ChartPanel = ({
  title,
  subtitle,
  children,
  fullWidth = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  fullWidth?: boolean;
}) => (
  <View style={fullWidth ? [styles.chartPanel, styles.chartPanelFull] : styles.chartPanel}>
    <Text style={styles.chartTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);
