import { MATERIAL_TYPES } from '@/shared/profile/supportOptions';
import type { MaterialType } from '@/shared/types/contract';
import Icon, { type IconName } from '@/shared/ui/Icon';

const ICONS: Record<MaterialType, IconName> = {
  test: 'test',
  activity: 'activity',
  content: 'book',
};
const HINTS: Record<MaterialType, string> = {
  test: 'Avaliação com questões',
  activity: 'Exercício de sala ou de casa',
  content: 'Slide ou texto de aula',
};

interface MaterialTypePickerProps {
  value: MaterialType;
  onChange: (value: MaterialType) => void;
}

/** RF-26: test (default), activity or content. */
export default function MaterialTypePicker({ value, onChange }: MaterialTypePickerProps) {
  return (
    <fieldset>
      <legend className="sr-only">Tipo de material</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {MATERIAL_TYPES.map((type) => {
          const checked = value === type.value;
          return (
            <label
              key={type.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-colors has-focus-visible:ring-4 has-focus-visible:ring-brand-100 ${
                checked
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="materialType"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(type.value)}
              />
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  checked ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon name={ICONS[type.value]} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{type.label.split(' (')[0]}</span>
                <span className="block text-sm text-slate-600">{HINTS[type.value]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
