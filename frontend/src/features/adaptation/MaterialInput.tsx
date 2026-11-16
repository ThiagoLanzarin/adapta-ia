import { useState } from 'react';

import type { OriginalMaterial } from '@/shared/types/original';

import { MAX_UPLOAD_BYTES, reduceImage } from './reduceImage';

export const MAX_TEXT_LENGTH = 20_000;
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif';

interface MaterialInputProps {
  value: OriginalMaterial | null;
  onChange: (value: OriginalMaterial | null) => void;
  onError: (message: string) => void;
}

/** Photo of the blank test (reduced in the browser) or pasted text (RF-01, RF-19). */
export default function MaterialInput({ value, onChange, onError }: MaterialInputProps) {
  const [mode, setMode] = useState<'image' | 'text'>(value?.kind ?? 'image');
  const [reducing, setReducing] = useState(false);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setReducing(true);
    const image = await reduceImage(file);
    setReducing(false);
    if (image.size > MAX_UPLOAD_BYTES) {
      onError('A foto passa de 20 MB. Tire a foto de novo ou cole o texto.');
      return;
    }
    if (value?.kind === 'image') URL.revokeObjectURL(value.url);
    onChange({ kind: 'image', image, url: URL.createObjectURL(image) });
  };

  const switchTo = (next: 'image' | 'text') => {
    setMode(next);
    onChange(null);
  };

  return (
    <fieldset>
      <legend className="mb-2 font-semibold">Material</legend>
      <div className="mb-3 flex gap-2">
        {(['image', 'text'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchTo(option)}
            className={`rounded-lg px-4 py-2 ${mode === option ? 'bg-teal-700 text-white' : 'bg-slate-200'}`}
          >
            {option === 'image' ? 'Foto da prova' : 'Colar texto'}
          </button>
        ))}
      </div>
      {mode === 'image' ? (
        <div className="space-y-3">
          <input
            type="file"
            accept={ACCEPTED}
            aria-label="Foto da prova em branco"
            onChange={(event) => void choose(event.target.files?.[0])}
          />
          <p className="text-sm text-slate-600">Fotografe a prova em branco, sem nome de aluno.</p>
          {reducing && <p className="text-sm">Preparando a foto...</p>}
          {value?.kind === 'image' && (
            <img src={value.url} alt="Prova enviada" className="max-h-64 rounded border" />
          )}
        </div>
      ) : (
        <label className="block">
          <textarea
            className="block w-full rounded-lg border border-slate-300 p-3"
            rows={8}
            maxLength={MAX_TEXT_LENGTH}
            aria-label="Texto da prova"
            placeholder="Cole aqui o texto da prova ou da atividade."
            value={value?.kind === 'text' ? value.text : ''}
            onChange={(event) =>
              onChange(event.target.value ? { kind: 'text', text: event.target.value } : null)
            }
          />
          <span className="mt-1 block text-right text-sm text-slate-600">
            {value?.kind === 'text' ? value.text.length : 0}/{MAX_TEXT_LENGTH}
          </span>
        </label>
      )}
    </fieldset>
  );
}
