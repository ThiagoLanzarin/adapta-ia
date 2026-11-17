import { useState } from 'react';

import { listSlides } from '@/shared/api/slides';
import { ApiError } from '@/shared/api/client';
import type { Slide } from '@/shared/types/contract';
import Alert from '@/shared/ui/Alert';
import Icon from '@/shared/ui/Icon';

import Dropzone from './Dropzone';
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
    <div className="space-y-4">
      <Dropzone
        icon="slides"
        title={slides ? 'Trocar o arquivo' : 'Escolher o PowerPoint'}
        hint="Arquivo .pptx. Só o texto dos slides é lido."
        accept={ACCEPTED}
        inputLabel="Arquivo PowerPoint"
        busy={reading ? 'Lendo os slides...' : null}
        onFile={(file) => void send(file)}
      />
      {slides && !slides.some(hasText) && (
        <Alert tone="warning">
          Este arquivo não tem texto nos slides. Tire uma foto ou cole o texto.
        </Alert>
      )}
      {slides && slides.some(hasText) && (
        <fieldset className="space-y-3">
          <legend className="mb-2 flex w-full flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">Marque os slides da prova (até {MAX_SLIDES})</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${chosen.length > 0 ? 'bg-brand-100 text-brand-900' : 'bg-slate-100 text-slate-600'}`}
            >
              {chosen.length} de {MAX_SLIDES} marcado(s)
            </span>
          </legend>
          {limitHit && <Alert tone="warning">Escolha até {MAX_SLIDES} slides por vez.</Alert>}
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {slides.map((slide) => {
              const empty = !hasText(slide);
              return (
                <li key={slide.index}>
                  <label
                    className={`flex gap-3 rounded-xl border-2 p-3 transition-colors ${empty ? 'border-slate-100 bg-slate-50 text-slate-500' : 'cursor-pointer border-slate-200 hover:border-slate-300 hover:bg-slate-50 has-checked:border-brand-600 has-checked:bg-brand-50 has-focus-visible:ring-4 has-focus-visible:ring-brand-100'}`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      disabled={empty}
                      checked={chosen.includes(slide.index)}
                      onChange={() => toggle(slide.index)}
                    />
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white text-transparent peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-disabled:opacity-40"
                    >
                      <Icon name="check" className="size-4" />
                    </span>
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
