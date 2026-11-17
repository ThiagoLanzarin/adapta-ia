import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  /** Small label above the title, like the section name. */
  eyebrow?: string;
  /** Buttons on the right of the title. */
  actions?: ReactNode;
}

export default function PageTitle({ title, subtitle, eyebrow, actions }: PageTitleProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-lg text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
