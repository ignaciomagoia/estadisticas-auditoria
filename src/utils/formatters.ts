export const formatNumber = (value: number) => new Intl.NumberFormat('es-AR').format(value);

export const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value)}%`;

export const formatDecimal = (value: number | null, suffix = '') => {
  if (value === null || Number.isNaN(value)) return '-';
  return `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value)}${suffix}`;
};

export const formatDate = (date: Date | null) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};
