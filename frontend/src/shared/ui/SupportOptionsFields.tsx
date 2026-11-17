import {
  NOTES_HINT,
  NOTES_MAX_LENGTH,
  SUPPORT_OPTIONS,
  type SupportOptionKey,
} from '@/shared/profile/supportOptions';
import type { StudentProfile } from '@/shared/types/contract';

import Icon from './Icon';
import { INPUT_CLASS } from './styles';

interface SupportOptionsFieldsProps {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
}

/** The support options and the notes (spec 003). Used when adapting and in the profiles. */
export default function SupportOptionsFields({ profile, onChange }: SupportOptionsFieldsProps) {
  const toggle = (key: SupportOptionKey) => onChange({ ...profile, [key]: !profile[key] });
  const marked = SUPPORT_OPTIONS.filter((option) => profile[option.key]).length;

  return (
    <fieldset className="space-y-5">
      <legend className="mb-3 flex w-full items-baseline justify-between gap-2">
        <span className="font-semibold">O que ajuda o aluno?</span>
        <span className="text-sm text-slate-500">
          {marked === 0 ? 'Nenhuma marcada' : `${marked} marcada${marked > 1 ? 's' : ''}`}
        </span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {SUPPORT_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50 has-checked:border-brand-600 has-checked:bg-brand-50 has-focus-visible:ring-4 has-focus-visible:ring-brand-100"
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={profile[option.key]}
              onChange={() => toggle(option.key)}
            />
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white text-transparent transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white"
            >
              <Icon name="check" className="size-4" />
            </span>
            <span className="leading-snug">{option.label}</span>
          </label>
        ))}
      </div>
      <label className="block">
        <span className="font-semibold">Observações</span>
        <span className="ml-2 text-sm text-slate-500">(opcional)</span>
        <textarea
          className={`${INPUT_CLASS} mt-1.5`}
          rows={3}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="Ex.: TEA nível 1. Aprende melhor com imagens e frases curtas."
          value={profile.notes}
          onChange={(event) => onChange({ ...profile, notes: event.target.value })}
        />
        <span className="mt-1.5 flex justify-between gap-4 text-sm text-slate-600">
          <span className="flex items-start gap-1.5">
            <Icon name="lock" className="mt-0.5 size-4 text-amber-600" />
            {NOTES_HINT}
          </span>
          <span className="shrink-0 tabular-nums">
            {profile.notes.length}/{NOTES_MAX_LENGTH}
          </span>
        </span>
      </label>
    </fieldset>
  );
}
