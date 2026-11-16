import { useState } from 'react';

import { EMPTY_PROFILE } from '@/shared/profile/supportOptions';
import type { Adaptation, MaterialType, StudentProfile } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';
import SupportOptionsFields from '@/shared/ui/SupportOptionsFields';

import MaterialInput from './MaterialInput';
import MaterialTypePicker from './MaterialTypePicker';
import { useAdaptationRequest } from './useAdaptationRequest';

interface AdaptationFormProps {
  onDone: (adaptation: Adaptation, original: OriginalMaterial, profile: StudentProfile) => void;
}

/** Spec 001: type of material, support options, photo or text, progress and errors. */
export default function AdaptationForm({ onDone }: AdaptationFormProps) {
  const [materialType, setMaterialType] = useState<MaterialType>('test');
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [material, setMaterial] = useState<OriginalMaterial | null>(null);
  const { status, error, seconds, submit, showError } = useAdaptationRequest();
  const loading = status === 'loading';

  const send = async () => {
    if (!material) {
      showError('Envie a foto da prova ou cole o texto.');
      return;
    }
    const adaptation = await submit({
      materialType,
      profile,
      ...(material.kind === 'image' ? { image: material.image } : { text: material.text }),
    });
    if (adaptation) onDone(adaptation, material, profile);
  };

  return (
    <form
      className="space-y-8 rounded-xl bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <MaterialTypePicker value={materialType} onChange={setMaterialType} />
      <SupportOptionsFields profile={profile} onChange={setProfile} />
      <MaterialInput value={material} onChange={setMaterial} onError={showError} />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? 'Adaptando...' : 'Adaptar'}
        </button>
        {loading && (
          <p aria-live="polite" className="text-slate-700">
            A IA está lendo e adaptando a prova ({seconds} s). Pode levar até 1 minuto.
          </p>
        )}
      </div>
    </form>
  );
}
