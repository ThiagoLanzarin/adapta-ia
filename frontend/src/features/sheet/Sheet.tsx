import { ARASAAC_CREDIT } from '@/shared/pictograms';
import type { Adaptation } from '@/shared/types/contract';

import type { SheetActions } from './editAdaptation';
import { SHEET_ATTRIBUTE } from './printSheet';
import SheetStep from './SheetStep';

interface SheetProps {
  adaptation: Adaptation;
  imageUrl: string | null;
  color: boolean;
  onePerPage: boolean;
  actions: SheetActions;
}

/** The student's sheet: what will be printed (spec 006). Nothing for the teacher goes here. */
export default function Sheet({ adaptation, imageUrl, color, onePerPage, actions }: SheetProps) {
  const firstQuestion = adaptation.steps.findIndex((step) => step.kind === 'question');

  return (
    <article
      {...{ [SHEET_ATTRIBUTE]: '' }}
      className="rounded-xl bg-white p-8 shadow-sm print:rounded-none print:p-0 print:shadow-none"
    >
      {/* CA-006-07, R-006-03: filled in by hand; the system never receives the name. */}
      <div className="mb-8 flex gap-6 text-lg">
        <p className="flex flex-1 items-end gap-2">
          Nome:
          <span className="flex-1 border-b border-slate-500" />
        </p>
        <p className="flex w-48 items-end gap-2">
          Data:
          <span className="flex-1 border-b border-slate-500" />
        </p>
      </div>
      <h2 className="mb-8 text-2xl font-bold">{adaptation.title}</h2>
      <ol className="space-y-10">
        {adaptation.steps.map((step, index) => {
          // CA-006-06: "se distrai fácil" puts each question on its own page.
          const newPage = onePerPage && step.kind === 'question' && index > firstQuestion;
          return (
            <li key={step.id} className={newPage ? 'print:break-before-page' : undefined}>
              <SheetStep step={step} imageUrl={imageUrl} color={color} actions={actions} />
            </li>
          );
        })}
      </ol>
      {/* On screen only: in print the credit is in every page margin (index.css). */}
      <footer className="mt-12 print:hidden border-t border-slate-200 pt-3 text-xs text-slate-500">
        {ARASAAC_CREDIT}
      </footer>
    </article>
  );
}
