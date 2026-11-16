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
      {original.kind === 'image' ? (
        <img src={original.url} alt="Prova original" className="w-full rounded border" />
      ) : (
        <p className="whitespace-pre-line rounded bg-slate-50 p-3">{original.text}</p>
      )}
      <details className="rounded bg-slate-50 p-3">
        <summary className="cursor-pointer font-semibold">Texto que a IA leu</summary>
        <p className="mt-2 whitespace-pre-line text-sm">{transcription || '(nada foi lido)'}</p>
      </details>
    </section>
  );
}
