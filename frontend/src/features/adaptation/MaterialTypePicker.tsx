import { MATERIAL_TYPES } from '@/shared/profile/supportOptions';
import type { MaterialType } from '@/shared/types/contract';

interface MaterialTypePickerProps {
  value: MaterialType;
  onChange: (value: MaterialType) => void;
}

/** RF-26: test (default), activity or content. */
export default function MaterialTypePicker({ value, onChange }: MaterialTypePickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">Tipo de material</legend>
      <div className="flex flex-wrap gap-3">
        {MATERIAL_TYPES.map((type) => (
          <label
            key={type.value}
            className={`cursor-pointer rounded-lg border px-4 py-2 ${
              value === type.value ? 'border-teal-700 bg-teal-50 font-semibold' : 'border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="materialType"
              className="sr-only"
              checked={value === type.value}
              onChange={() => onChange(type.value)}
            />
            {type.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
