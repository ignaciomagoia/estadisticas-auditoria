import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
    <div className="h-80 min-h-0">{children}</div>
  </article>
);
