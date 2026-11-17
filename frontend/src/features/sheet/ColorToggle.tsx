interface ColorToggleProps {
  color: boolean;
  onChange: (color: boolean) => void;
}

const CHOICES = [
  {
    value: true,
    label: 'Colorido',
    swatch: 'bg-gradient-to-br from-amber-400 via-brand-500 to-sky-500',
  },
  { value: false, label: 'Preto e branco', swatch: 'bg-gradient-to-br from-white to-slate-900' },
] as const;

/** CA-004-24: every pictogram of the sheet in color or black and white. R-004-02: a screen
 * choice, not part of the Adaptation. */
export default function ColorToggle({ color, onChange }: ColorToggleProps) {
  return (
    <div
      role="group"
      aria-label="Cor dos pictogramas"
      className="flex gap-1 rounded-xl bg-slate-100 p-1"
    >
      {CHOICES.map((choice) => (
        <button
          key={choice.label}
          type="button"
          aria-pressed={color === choice.value}
          onClick={() => onChange(choice.value)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-600 transition-colors hover:text-slate-900 aria-pressed:bg-white aria-pressed:font-semibold aria-pressed:text-slate-900 aria-pressed:shadow-sm"
        >
          <span
            aria-hidden="true"
            className={`size-3.5 rounded-full ring-1 ring-slate-300 ${choice.swatch}`}
          />
          {choice.label}
        </button>
      ))}
    </div>
  );
}
