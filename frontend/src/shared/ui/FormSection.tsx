import type { ReactNode } from 'react';

import { CARD_CLASS } from './styles';

interface FormSectionProps {
  /** Step number shown in the circle; without it, no circle. */
  step?: number;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  /** Something on the right of the title, like a counter. */
  aside?: ReactNode;
}

/** A numbered card of a form, so the teacher sees the order of what to fill. */
export default function FormSection({ step, title, hint, children, aside }: FormSectionProps) {
  return (
    <section className={`${CARD_CLASS} p-5 sm:p-6`}>
      <header className="mb-5 flex items-start gap-3">
        {step !== undefined && (
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
          >
            {step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-slate-600">{hint}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
