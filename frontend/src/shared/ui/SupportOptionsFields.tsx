import {
  NOTES_HINT,
  NOTES_MAX_LENGTH,
  SUPPORT_OPTIONS,
  type SupportOptionKey,
} from '@/shared/profile/supportOptions';
import type { StudentProfile } from '@/shared/types/contract';

interface SupportOptionsFieldsProps {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
}

/** The 5 support options and the notes (spec 003). Used when adapting and in the profiles. */
export default function SupportOptionsFields({ profile, onChange }: SupportOptionsFieldsProps) {
  const toggle = (key: SupportOptionKey) => onChange({ ...profile, [key]: !profile[key] });

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-semibold">O que ajuda o aluno?</legend>
      {SUPPORT_OPTIONS.map((option) => (
        <label key={option.key} className="flex items-center gap-3">
          <input
            type="checkbox"
            className="size-5 accent-teal-700"
            checked={profile[option.key]}
            onChange={() => toggle(option.key)}
          />
          {option.label}
        </label>
      ))}
      <label className="mt-4 block">
        <span className="font-semibold">Observações</span>
        <textarea
          className="mt-1 block w-full rounded-lg border border-slate-300 p-3"
          rows={3}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="Ex.: TEA nível 1. Aprende melhor com imagens e frases curtas."
          value={profile.notes}
          onChange={(event) => onChange({ ...profile, notes: event.target.value })}
        />
        <span className="mt-1 flex justify-between text-sm text-slate-600">
          <span>{NOTES_HINT}</span>
          <span>
            {profile.notes.length}/{NOTES_MAX_LENGTH}
          </span>
        </span>
      </label>
    </fieldset>
  );
}
