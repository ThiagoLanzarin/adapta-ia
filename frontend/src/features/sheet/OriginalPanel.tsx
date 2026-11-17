import type { OriginalMaterial } from '@/shared/types/original';
import Icon from '@/shared/ui/Icon';
import { CARD_CLASS } from '@/shared/ui/styles';

interface OriginalPanelProps {
  original: OriginalMaterial;
  transcription: string;
}

/** CA-001-23: the original and the text the AI read, to check the reading. */
export default function OriginalPanel({ original, transcription }: OriginalPanelProps) {
  return (
    <section className={`${CARD_CLASS} space-y-4 p-5`}>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon name="image" className="size-5 text-slate-500" />
        Original
      </h2>
      {original.kind === 'image' && (
        <a
          href={original.url}
          target="_blank"
          rel="noreferrer"
          title="Abrir a foto em tamanho real"
        >
          <img
            src={original.url}
            alt="Prova original"
            className="w-full rounded-lg border border-slate-200 transition-opacity hover:opacity-90"
          />
        </a>
      )}
      {original.kind === 'text' && (
        <p className="max-h-96 overflow-y-auto whitespace-pre-line rounded-lg bg-slate-50 p-3">
          {original.text}
        </p>
      )}
      {/* CA-002-23: the text of the chosen slides. */}
      {original.kind === 'slides' &&
        original.slides.map((slide) => (
          <div key={slide.index} className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-500">Slide {slide.index}</p>
            {slide.title && !slide.text.startsWith(slide.title.replace(/…$/, '')) && (
              <p className="font-semibold">{slide.title}</p>
            )}
            <p className="whitespace-pre-line">{slide.text}</p>
          </div>
        ))}
      <details className="group rounded-lg border border-slate-200">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 font-semibold hover:bg-slate-50">
          Texto que a IA leu
          <Icon
            name="arrowRight"
            className="size-4 text-slate-400 transition-transform group-open:rotate-90"
          />
        </summary>
        <p className="border-t border-slate-200 px-3 py-3 text-sm whitespace-pre-line text-slate-700">
          {transcription || '(nada foi lido)'}
        </p>
      </details>
    </section>
  );
}
