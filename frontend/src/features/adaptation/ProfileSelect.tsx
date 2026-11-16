import { useState } from 'react';
import { Link } from 'react-router';

import { EMPTY_PROFILE } from '@/shared/profile/supportOptions';
import { useProfileList } from '@/shared/profile/useProfileList';
import { toStudentProfile } from '@/shared/storage/profiles';
import type { StudentProfile } from '@/shared/types/contract';

interface ProfileSelectProps {
  onChoose: (profile: StudentProfile) => void;
}

/** CA-003-05: choosing a profile marks its options below; changing them afterwards is only
 * for this adaptation. R-003-02: only the options and notes leave this component. */
export default function ProfileSelect({ onChoose }: ProfileSelectProps) {
  const { profiles, error } = useProfileList();
  const [chosen, setChosen] = useState('');

  if (profiles === null) return null;
  if (error) return <p className="text-sm text-amber-900">{error}</p>;
  if (profiles.length === 0) {
    return (
      <p className="text-slate-700">
        Crie um perfil ou marque as opções abaixo.{' '}
        <Link to="/perfis" className="text-teal-700 underline">
          Criar perfil
        </Link>
      </p>
    );
  }

  return (
    <label className="block">
      <span className="font-semibold">Perfil do aluno</span>
      <select
        value={chosen}
        onChange={(event) => {
          setChosen(event.target.value);
          const profile = profiles.find((current) => current.id === event.target.value);
          onChoose(profile ? toStudentProfile(profile) : EMPTY_PROFILE);
        }}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
      >
        <option value="">Sem perfil (marcar as opções abaixo)</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.nickname}
          </option>
        ))}
      </select>
    </label>
  );
}
