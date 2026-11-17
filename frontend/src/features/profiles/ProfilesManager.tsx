import { useState } from 'react';

import { EMPTY_PROFILE, SUPPORT_OPTIONS } from '@/shared/profile/supportOptions';
import { useProfileList } from '@/shared/profile/useProfileList';
import { deleteProfile, type SavedProfile, saveProfile } from '@/shared/storage/profiles';
import Alert from '@/shared/ui/Alert';
import EmptyState from '@/shared/ui/EmptyState';
import Icon from '@/shared/ui/Icon';
import { buttonClass, CARD_CLASS } from '@/shared/ui/styles';

import ProfileEditor from './ProfileEditor';
import ProfileFileButtons from './ProfileFileButtons';

function markedOptions(profile: SavedProfile): string[] {
  return SUPPORT_OPTIONS.filter((option) => profile[option.key]).map(
    (option) => option.label.split(' (')[0],
  );
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

  if (profiles === null) return <p className="text-slate-600">Carregando os perfis...</p>;

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

  const createNew = () => setEditing({ ...EMPTY_PROFILE, id: crypto.randomUUID(), nickname: '' });

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {profiles.length === 0 && !error ? (
        <EmptyState
          icon="user"
          title="Nenhum perfil ainda"
          action={
            <button type="button" onClick={createNew} className={buttonClass('primary', 'md')}>
              <Icon name="plus" />
              Novo perfil
            </button>
          }
        >
          Crie um para usar ao adaptar: as opções de apoio do aluno já vêm marcadas.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => {
            const marked = markedOptions(profile);
            return (
              <li key={profile.id} className={`${CARD_CLASS} flex flex-col gap-4 p-5`}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800"
                  >
                    {profile.nickname.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-lg font-semibold">
                    {profile.nickname}
                  </p>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {marked.length === 0 && (
                    <li className="text-sm text-slate-500">Nenhuma opção marcada</li>
                  )}
                  {marked.map((label) => (
                    <li
                      key={label}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-700"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
                {/* CA-003-03: delete only after confirming. */}
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  {confirming === profile.id ? (
                    <>
                      <span className="text-sm font-semibold text-red-900">
                        Apagar o perfil? O histórico continua.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirming(null);
                          void run(() => deleteProfile(profile.id));
                        }}
                        className={buttonClass('danger', 'sm')}
                      >
                        Sim, apagar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className={buttonClass('secondary', 'sm')}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(profile)}
                        className={buttonClass('secondary', 'sm')}
                      >
                        <Icon name="pencil" className="size-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(profile.id)}
                        className={buttonClass('dangerSoft', 'sm')}
                      >
                        <Icon name="trash" className="size-4" />
                        Apagar
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={createNew}
              className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800"
            >
              <Icon name="plus" className="size-7" />
              <span className="font-semibold">Novo perfil</span>
            </button>
          </li>
        </ul>
      )}
      <ProfileFileButtons profiles={profiles} onImported={reload} />
    </div>
  );
}
