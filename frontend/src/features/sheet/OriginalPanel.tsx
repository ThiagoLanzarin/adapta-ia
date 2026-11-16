import type { OriginalMaterial } from '@/shared/types/original';

interface OriginalPanelProps {
  original: OriginalMaterial;
  transcription: string;
}

/** CA-001-23: the original and the text the AI read, to check the reading. */
export default function OriginalPanel({ original, transcription }: OriginalPanelProps) {
  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">Original</h2>
      {original.kind === 'image' && (
        <img src={original.url} alt="Prova original" className="w-full rounded border" />
      )}
      {original.kind === 'text' && (
        <p className="whitespace-pre-line rounded bg-slate-50 p-3">{original.text}</p>
      )}
      {/* CA-002-23: the text of the chosen slides. */}
      {original.kind === 'slides' &&
        original.slides.map((slide) => (
          <div key={slide.index} className="rounded bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-600">Slide {slide.index}</p>
            {slide.title && !slide.text.startsWith(slide.title.replace(/…$/, '')) && (
              <p className="font-semibold">{slide.title}</p>
            )}
            <p className="whitespace-pre-line">{slide.text}</p>
          </div>
        ))}
      <details className="rounded bg-slate-50 p-3">
        <summary className="cursor-pointer font-semibold">Texto que a IA leu</summary>
        <p className="mt-2 whitespace-pre-line text-sm">{transcription || '(nada foi lido)'}</p>
      </details>
    </section>
  );
}
