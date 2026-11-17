// One place for the look of buttons, fields and cards, so every screen matches.
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerSoft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ' +
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  outline:
    'border-2 border-brand-700 bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  dangerSoft: 'text-red-800 hover:bg-red-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5 text-lg',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim();
}

/** Text inputs and text areas. */
export const INPUT_CLASS =
  'block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors hover:border-slate-400 ' +
  'focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 ' +
  'disabled:bg-slate-100';

/** White rounded panel. */
export const CARD_CLASS = 'rounded-2xl border border-slate-200/80 bg-white shadow-card';
