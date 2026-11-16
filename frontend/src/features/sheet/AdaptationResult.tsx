import { useState } from 'react';

import type { Adaptation } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';

import ColorToggle from './ColorToggle';
import {
  type KeywordRef,
  removeFigure,
  type SheetActions,
  setOptionText,
  setPictogram,
  setStepText,
} from './editAdaptation';
import OriginalPanel from './OriginalPanel';
import PictogramPicker from './PictogramPicker';
import PrintButtons from './PrintButtons';
import ReviewNotes from './ReviewNotes';
import Sheet from './Sheet';

interface AdaptationResultProps {
  adaptation: Adaptation;
  original: OriginalMaterial;
  /** Profile option "se distrai fácil" (CA-006-06). */
  onePerPage: boolean;
  onChange: (adaptation: Adaptation) => void;
  onNew: () => void;
}

/** Spec 001, RF-09: original and adapted sheet side by side, with the notes outside it.
 * Spec 004: the teacher fixes the sheet here; every edit goes up through `onChange`. */
export default function AdaptationResult({
  adaptation,
  original,
  onePerPage,
  onChange,
  onNew,
}: AdaptationResultProps) {
  const [picking, setPicking] = useState<KeywordRef | null>(null);
  const imageUrl = original.kind === 'image' ? original.url : null;
  const [color, setColor] = useState(true);
  const pickedKeyword = picking
    ? adaptation.steps.find((step) => step.id === picking.stepId)?.keywords[picking.index]
    : undefined;

  const actions: SheetActions = {
    pickPictogram: setPicking,
    editText: (stepId, text) => onChange(setStepText(adaptation, stepId, text)),
    editOption: (stepId, index, text) => onChange(setOptionText(adaptation, stepId, index, text)),
    removeFigure: (stepId) => onChange(removeFigure(adaptation, stepId)),
  };

  function choose(pictogramId: number | null) {
    if (picking) onChange(setPictogram(adaptation, picking, pictogramId));
    setPicking(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-slate-700">
          Confira a folha antes de imprimir. Clique num texto para reescrever ou num pictograma para
          trocar.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ColorToggle color={color} onChange={setColor} />
          <PrintButtons />
          <button type="button" onClick={onNew} className="rounded-lg bg-slate-200 px-4 py-2">
            Adaptar outro material
          </button>
        </div>
      </div>
      <ReviewNotes adaptation={adaptation} />
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr] print:block">
        <div className="print:hidden lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
          <OriginalPanel original={original} transcription={adaptation.transcription} />
        </div>
        <Sheet
          adaptation={adaptation}
          imageUrl={imageUrl}
          color={color}
          onePerPage={onePerPage}
          actions={actions}
        />
      </div>
      {pickedKeyword && (
        <PictogramPicker
          keyword={pickedKeyword}
          color={color}
          onChoose={choose}
          onRemove={() => choose(null)}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}
