import { useState } from 'react';

import { NICKNAME_MAX_LENGTH, type SavedProfile } from '@/shared/storage/profiles';
import FormSection from '@/shared/ui/FormSection';
import Icon from '@/shared/ui/Icon';
import { buttonClass, INPUT_CLASS } from '@/shared/ui/styles';
import SupportOptionsFields from '@/shared/ui/SupportOptionsFields';

interface ProfileEditorProps {
  initial: SavedProfile;
  onSave: (profile: SavedProfile) => void;
  onCancel: () => void;
}

/** CA-003-01, CA-003-02, CA-003-07: nickname (required, up to 30), the support options and
 * the notes (up to 500, with the hint not to write the student's name). */
export default function ProfileEditor({ initial, onSave, onCancel }: ProfileEditorProps) {
  const [profile, setProfile] = useState(initial);
  const nickname = profile.nickname.trim();

  return (
    <form
      className="mx-auto max-w-3xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (nickname) onSave({ ...profile, nickname });
      }}
    >
      <button type="button" onClick={onCancel} className={buttonClass('ghost', 'sm', '-ml-3')}>
        <Icon name="arrowLeft" className="size-4" />
        Voltar aos perfis
      </button>
      <FormSection
        step={1}
        title="Apelido do aluno"
        hint="Use um apelido. Ele fica só neste navegador."
      >
        <label className="block">
          <span className="sr-only">Apelido do aluno</span>
          <input
            required
            autoFocus
            maxLength={NICKNAME_MAX_LENGTH}
            value={profile.nickname}
            onChange={(event) => setProfile({ ...profile, nickname: event.target.value })}
            placeholder="Ex.: Aluno A do 5º ano"
            className={INPUT_CLASS}
          />
          <span className="mt-1.5 block text-right text-sm tabular-nums text-slate-600">
            {profile.nickname.length}/{NICKNAME_MAX_LENGTH}
          </span>
        </label>
      </FormSection>
      <FormSection step={2} title="Necessidades de apoio">
        <SupportOptionsFields
          profile={profile}
          onChange={(options) => setProfile({ ...profile, ...options })}
        />
      </FormSection>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={!nickname} className={buttonClass('primary', 'lg')}>
          <Icon name="check" />
          Salvar perfil
        </button>
        <button type="button" onClick={onCancel} className={buttonClass('secondary', 'lg')}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
