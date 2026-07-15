import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

export const PageShell = ({ children }: PageShellProps) => (
  <main className="min-h-screen bg-slate-50 text-slate-950">
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
  </main>
);
