interface ColorToggleProps {
  color: boolean;
  onChange: (color: boolean) => void;
}

const CHOICES = [
  { value: true, label: 'Colorido' },
  { value: false, label: 'Preto e branco' },
] as const;

/** CA-004-24: every pictogram of the sheet in color or black and white. R-004-02: a screen
 * choice, not part of the Adaptation. */
export default function ColorToggle({ color, onChange }: ColorToggleProps) {
  return (
    <div
      role="group"
      aria-label="Cor dos pictogramas"
      className="flex gap-1 rounded-lg bg-slate-200 p-1"
    >
      {CHOICES.map((choice) => (
        <button
          key={choice.label}
          type="button"
          aria-pressed={color === choice.value}
          onClick={() => onChange(choice.value)}
          className="rounded-md px-3 py-1 aria-pressed:bg-white aria-pressed:font-semibold aria-pressed:shadow-sm"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
