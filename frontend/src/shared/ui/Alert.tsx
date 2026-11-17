import type { ReactNode } from 'react';

import Icon, { type IconName } from './Icon';

type Tone = 'error' | 'warning' | 'info' | 'success';

const TONES: Record<Tone, { box: string; icon: IconName; iconColor: string }> = {
  error: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'alert', iconColor: 'text-red-600' },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'alert',
    iconColor: 'text-amber-600',
  },
  info: { box: 'border-sky-200 bg-sky-50 text-sky-950', icon: 'info', iconColor: 'text-sky-600' },
  success: {
    box: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: 'check',
    iconColor: 'text-brand-600',
  },
};

interface AlertProps {
  tone: Tone;
  children: ReactNode;
  title?: string;
  /** "alert" for errors and warnings the teacher must see now; "status" for the rest. */
  role?: 'alert' | 'status';
  className?: string;
}

/** A message in a colored box with an icon (constitution E7: errors in Portuguese). */
export default function Alert({ tone, children, title, role, className = '' }: AlertProps) {
  const style = TONES[tone];
  return (
    <div
      role={role ?? (tone === 'error' || tone === 'warning' ? 'alert' : undefined)}
      className={`animate-fade-in flex gap-3 rounded-xl border p-3.5 ${style.box} ${className}`}
    >
      <Icon name={style.icon} className={`mt-0.5 size-5 ${style.iconColor}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
