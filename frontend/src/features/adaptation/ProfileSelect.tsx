import { useState } from 'react';
import { Link } from 'react-router';

import { EMPTY_PROFILE } from '@/shared/profile/supportOptions';
import { useProfileList } from '@/shared/profile/useProfileList';
import { toStudentProfile } from '@/shared/storage/profiles';
import type { StudentProfile } from '@/shared/types/contract';
import Icon from '@/shared/ui/Icon';

interface ProfileSelectProps {
  onChoose: (profile: StudentProfile) => void;
}

const PILL =
  'flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 transition-colors ' +
  'has-focus-visible:ring-4 has-focus-visible:ring-brand-100 ' +
  'border-slate-200 hover:border-slate-300 has-checked:border-brand-600 has-checked:bg-brand-50 ' +
  'has-checked:font-semibold has-checked:text-brand-900';

/** CA-003-05: choosing a profile marks its options below; changing them afterwards is only
 * for this adaptation. R-003-02: only the options and notes leave this component. */
export default function ProfileSelect({ onChoose }: ProfileSelectProps) {
  const { profiles, error } = useProfileList();
  const [chosen, setChosen] = useState('');

  if (profiles === null) return null;
  if (error) return <p className="text-sm text-amber-900">{error}</p>;
  if (profiles.length === 0) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 rounded-xl bg-slate-50 px-4 py-3 text-slate-700">
        <Icon name="info" className="size-5 text-slate-400" />
        Crie um perfil ou marque as opções abaixo.
        <Link to="/perfis" className="font-semibold text-brand-700 underline">
          Criar perfil
        </Link>
      </p>
    );
  }

  const choose = (id: string) => {
    setChosen(id);
    const profile = profiles.find((current) => current.id === id);
    onChoose(profile ? toStudentProfile(profile) : EMPTY_PROFILE);
  };

  return (
    <fieldset>
      <legend className="mb-2 font-semibold">Perfil do aluno</legend>
      <div className="flex flex-wrap gap-2">
        <label className={PILL}>
          <input
            type="radio"
            name="profile"
            className="sr-only"
            checked={chosen === ''}
            onChange={() => choose('')}
          />
          Sem perfil
        </label>
        {profiles.map((profile) => (
          <label key={profile.id} className={PILL}>
            <input
              type="radio"
              name="profile"
              className="sr-only"
              checked={chosen === profile.id}
              onChange={() => choose(profile.id)}
            />
            <Icon name="user" className="size-4" />
            {profile.nickname}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
