import type { ReactNode } from 'react';

import Icon, { type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

/** What a list shows when it has nothing yet: what it is for and what to do. */
export default function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon name={icon} className="size-7" />
      </span>
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-slate-600">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
