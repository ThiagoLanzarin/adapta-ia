import { useState } from 'react';

import { listSlides } from '@/shared/api/slides';
import { ApiError } from '@/shared/api/client';
import type { Slide } from '@/shared/types/contract';

import { MAX_UPLOAD_BYTES } from './reduceImage';

export const MAX_SLIDES = 5;
const ACCEPTED = '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation';
const PREVIEW_CHARS = 140;

interface SlidePickerProps {
  /** The chosen slides, in file order; empty when none is marked. */
  onChange: (slides: Slide[]) => void;
  onError: (message: string) => void;
}

function preview(slide: Slide): string {
  // Without a title, the title is the start of the text (CA-002-02): skip the repeated part.
  const repeated = slide.title !== '' && slide.text.startsWith(slide.title.replace(/…$/, ''));
  const text = (repeated ? '' : slide.text).replace(/\s+/g, ' ').trim();
  return text.length > PREVIEW_CHARS ? `${text.slice(0, PREVIEW_CHARS - 1)}…` : text;
}

/** Spec 002: send a .pptx, see its slides and mark up to 5 (CA-002-20..22). */
export default function SlidePicker({ onChange, onError }: SlidePickerProps) {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [reading, setReading] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  const send = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      onError('O arquivo passa de 20 MB. Envie só os slides da prova ou cole o texto.');
      return;
    }
    setReading(true);
    try {
      setSlides(await listSlides(file));
      setChosen([]);
      setLimitHit(false);
      onChange([]);
    } catch (caught) {
      onError(caught instanceof ApiError ? caught.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setReading(false);
    }
  };

  const toggle = (index: number) => {
    if (!slides) return;
    const marked = chosen.includes(index);
    // CA-002-21: the sixth slide cannot be marked.
    if (!marked && chosen.length >= MAX_SLIDES) {
      setLimitHit(true);
      return;
    }
    setLimitHit(false);
    const next = marked ? chosen.filter((current) => current !== index) : [...chosen, index];
    setChosen(next);
    onChange(slides.filter((slide) => next.includes(slide.index)));
  };

  const hasText = (slide: Slide) => slide.text.trim() !== '' || slide.title.trim() !== '';

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-teal-700 bg-teal-50 px-4 py-6 text-center hover:bg-teal-100 focus-within:outline-2 focus-within:outline-teal-700">
        <span className="text-lg font-semibold text-teal-800">
          {slides ? 'Trocar o arquivo' : 'Escolher o PowerPoint'}
        </span>
        <span className="text-sm text-slate-600">Arquivo .pptx. Só o texto dos slides é lido.</span>
        <input
          type="file"
          accept={ACCEPTED}
          aria-label="Arquivo PowerPoint"
          className="sr-only"
          onChange={(event) => {
            void send(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      {reading && <p className="text-sm">Lendo os slides...</p>}
      {slides && !slides.some(hasText) && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">
          Este arquivo não tem texto nos slides. Tire uma foto ou cole o texto.
        </p>
      )}
      {slides && slides.some(hasText) && (
        <fieldset className="space-y-2">
          <legend className="mb-1 font-semibold">
            Marque os slides da prova (até {MAX_SLIDES}): {chosen.length} marcado(s)
          </legend>
          {limitHit && (
            <p role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">
              Escolha até {MAX_SLIDES} slides por vez.
            </p>
          )}
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {slides.map((slide) => {
              const empty = !hasText(slide);
              return (
                <li key={slide.index}>
                  <label
                    className={`flex gap-3 rounded-lg border p-3 ${empty ? 'border-slate-200 text-slate-500' : 'cursor-pointer border-slate-300 hover:bg-slate-50 has-checked:border-teal-700 has-checked:bg-teal-50'}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-5 shrink-0"
                      disabled={empty}
                      checked={chosen.includes(slide.index)}
                      onChange={() => toggle(slide.index)}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        Slide {slide.index}
                        {slide.title && `: ${slide.title}`}
                      </span>
                      {/* CA-002-22: slides without text cannot be chosen. */}
                      <span className="block text-sm text-slate-600">
                        {empty
                          ? 'Este slide não tem texto (figuras ainda não são lidas).'
                          : preview(slide)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
