import type { Adaptation } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';

import OriginalPanel from './OriginalPanel';
import ReviewNotes from './ReviewNotes';
import Sheet from './Sheet';

interface AdaptationResultProps {
  adaptation: Adaptation;
  original: OriginalMaterial;
  onNew: () => void;
}

/** Spec 001, RF-09: original and adapted sheet side by side, with the notes outside it. */
export default function AdaptationResult({ adaptation, original, onNew }: AdaptationResultProps) {
  const imageUrl = original.kind === 'image' ? original.url : null;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-slate-700">Confira a folha antes de imprimir.</p>
        <button type="button" onClick={onNew} className="rounded-lg bg-slate-200 px-4 py-2">
          Adaptar outro material
        </button>
      </div>
      <ReviewNotes adaptation={adaptation} />
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="print:hidden lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
          <OriginalPanel original={original} transcription={adaptation.transcription} />
        </div>
        <Sheet adaptation={adaptation} imageUrl={imageUrl} color />
      </div>
    </div>
  );
}
