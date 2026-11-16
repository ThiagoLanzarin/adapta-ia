import { useState } from 'react';

import { EMPTY_PROFILE, SUPPORT_OPTIONS } from '@/shared/profile/supportOptions';
import { useProfileList } from '@/shared/profile/useProfileList';
import { deleteProfile, type SavedProfile, saveProfile } from '@/shared/storage/profiles';

import ProfileEditor from './ProfileEditor';

function summary(profile: SavedProfile): string {
  const marked = SUPPORT_OPTIONS.filter((option) => profile[option.key]).map((option) =>
    option.label.split(' (')[0].toLowerCase(),
  );
  return marked.length > 0 ? marked.join(', ') : 'Nenhuma opção marcada';
}

/** Spec 003: create, edit and delete the student profiles of this browser. */
export default function ProfilesManager() {
  const { profiles, error, setError, reload } = useProfileList();
  const [editing, setEditing] = useState<SavedProfile | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    try {
      await action();
      await reload();
    } catch (caught) {
      setError((caught as Error).message);
    }
  };

  if (profiles === null) return <p>Carregando os perfis...</p>;

  if (editing) {
    return (
      <ProfileEditor
        initial={editing}
        onCancel={() => setEditing(null)}
        onSave={(profile) => {
          setEditing(null);
          void run(() => saveProfile(profile));
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => setEditing({ ...EMPTY_PROFILE, id: crypto.randomUUID(), nickname: '' })}
        className="rounded-lg bg-teal-700 px-6 py-2 font-semibold text-white"
      >
        Novo perfil
      </button>
      {profiles.length === 0 && !error && (
        <p className="text-slate-700">Nenhum perfil ainda. Crie um para usar ao adaptar.</p>
      )}
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{profile.nickname}</p>
              <p className="text-sm text-slate-600">{summary(profile)}</p>
            </div>
            {/* CA-003-03: delete only after confirming. */}
            {confirming === profile.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">Apagar o perfil? O histórico continua.</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(null);
                    void run(() => deleteProfile(profile.id));
                  }}
                  className="rounded-lg bg-red-700 px-3 py-1 text-white"
                >
                  Sim, apagar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="rounded-lg bg-slate-200 px-3 py-1"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(profile)}
                  className="rounded-lg bg-slate-200 px-3 py-1"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(profile.id)}
                  className="rounded-lg bg-red-50 px-3 py-1 text-red-800"
                >
                  Apagar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
