import { useState } from 'react';

import { NICKNAME_MAX_LENGTH, type SavedProfile } from '@/shared/storage/profiles';
import SupportOptionsFields from '@/shared/ui/SupportOptionsFields';

interface ProfileEditorProps {
  initial: SavedProfile;
  onSave: (profile: SavedProfile) => void;
  onCancel: () => void;
}

/** CA-003-01, CA-003-02, CA-003-07: nickname (required, up to 30), the 5 options and the
 * notes (up to 500, with the hint not to write the student's name). */
export default function ProfileEditor({ initial, onSave, onCancel }: ProfileEditorProps) {
  const [profile, setProfile] = useState(initial);
  const nickname = profile.nickname.trim();

  return (
    <form
      className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (nickname) onSave({ ...profile, nickname });
      }}
    >
      <label className="block">
        <span className="font-semibold">Apelido do aluno</span>
        <input
          required
          autoFocus
          maxLength={NICKNAME_MAX_LENGTH}
          value={profile.nickname}
          onChange={(event) => setProfile({ ...profile, nickname: event.target.value })}
          placeholder="Ex.: Aluno A do 5º ano"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <span className="mt-1 flex justify-between text-sm text-slate-600">
          <span>Use um apelido. Ele fica só neste navegador.</span>
          <span>
            {profile.nickname.length}/{NICKNAME_MAX_LENGTH}
          </span>
        </span>
      </label>
      <SupportOptionsFields
        profile={profile}
        onChange={(options) => setProfile({ ...profile, ...options })}
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!nickname}
          className="rounded-lg bg-teal-700 px-6 py-2 font-semibold text-white disabled:opacity-50"
        >
          Salvar perfil
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg bg-slate-200 px-6 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
