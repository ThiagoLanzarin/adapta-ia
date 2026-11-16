import { useState } from 'react';

import type { OriginalMaterial } from '@/shared/types/original';

import { MAX_UPLOAD_BYTES, reduceImage } from './reduceImage';
import SlidePicker from './SlidePicker';

export const MAX_TEXT_LENGTH = 20_000;
type Mode = OriginalMaterial['kind'];

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'image', label: 'Foto da prova' },
  { mode: 'text', label: 'Colar texto' },
  { mode: 'slides', label: 'PowerPoint' },
];
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif';

interface MaterialInputProps {
  value: OriginalMaterial | null;
  onChange: (value: OriginalMaterial | null) => void;
  onError: (message: string) => void;
}

/** Photo of the blank test (reduced in the browser), pasted text or PowerPoint slides
 * (RF-01, RF-19, RF-02). */
export default function MaterialInput({ value, onChange, onError }: MaterialInputProps) {
  const [mode, setMode] = useState<Mode>(value?.kind ?? 'image');
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

  const switchTo = (next: Mode) => {
    setMode(next);
    onChange(null);
  };

  return (
    <fieldset>
      <legend className="mb-2 font-semibold">Material</legend>
      <div className="mb-3 flex gap-2">
        {MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            aria-pressed={mode === option.mode}
            onClick={() => switchTo(option.mode)}
            className={`rounded-lg px-4 py-2 ${mode === option.mode ? 'bg-teal-700 text-white' : 'bg-slate-200'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {mode === 'slides' && (
        <SlidePicker
          onChange={(slides) => onChange(slides.length > 0 ? { kind: 'slides', slides } : null)}
          onError={onError}
        />
      )}
      {mode === 'image' && (
        <div className="space-y-3">
          {/* The native file input looks like plain text after Tailwind's reset, so the
              visible part is the label, styled as a big button that opens the file window. */}
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-teal-700 bg-teal-50 px-4 py-6 text-center hover:bg-teal-100 focus-within:outline-2 focus-within:outline-teal-700">
            <span className="text-lg font-semibold text-teal-800">
              {value?.kind === 'image' ? 'Trocar a foto' : 'Escolher foto da prova'}
            </span>
            <span className="text-sm text-slate-600">PNG, JPG, WEBP ou HEIC (foto do celular)</span>
            <input
              type="file"
              accept={ACCEPTED}
              aria-label="Foto da prova em branco"
              className="sr-only"
              onChange={(event) => {
                void choose(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          <p className="text-sm text-slate-600">Fotografe a prova em branco, sem nome de aluno.</p>
          {reducing && <p className="text-sm">Preparando a foto...</p>}
          {value?.kind === 'image' && (
            <img src={value.url} alt="Prova enviada" className="max-h-64 rounded border" />
          )}
        </div>
      )}
      {mode === 'text' && (
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
