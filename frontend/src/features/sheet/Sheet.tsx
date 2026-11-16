import { ARASAAC_CREDIT } from '@/shared/pictograms';
import type { Adaptation } from '@/shared/types/contract';

import type { SheetActions } from './editAdaptation';
import SheetStep from './SheetStep';

interface SheetProps {
  adaptation: Adaptation;
  imageUrl: string | null;
  color: boolean;
  actions: SheetActions;
}

/** The student's sheet: what will be printed (spec 006). Nothing for the teacher goes here. */
export default function Sheet({ adaptation, imageUrl, color, actions }: SheetProps) {
  return (
    <article className="rounded-xl bg-white p-8 shadow-sm">
      <h2 className="mb-8 text-2xl font-bold">{adaptation.title}</h2>
      <ol className="space-y-10">
        {adaptation.steps.map((step) => (
          <li key={step.id}>
            <SheetStep step={step} imageUrl={imageUrl} color={color} actions={actions} />
          </li>
        ))}
      </ol>
      <footer className="mt-12 border-t border-slate-200 pt-3 text-xs text-slate-500">
        {ARASAAC_CREDIT}
      </footer>
    </article>
  );
}
