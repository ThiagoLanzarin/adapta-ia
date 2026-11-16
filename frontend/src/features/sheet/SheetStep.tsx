import type { Step } from '@/shared/types/contract';

import type { KeywordRef } from './editAdaptation';
import KeywordPictograms from './KeywordPictograms';
import QuestionStep from './QuestionStep';

interface SheetStepProps {
  step: Step;
  imageUrl: string | null;
  color: boolean;
  onPick: (ref: KeywordRef) => void;
}

/** One step of the sheet, by kind: instruction, support text or question. */
export default function SheetStep({ step, imageUrl, color, onPick }: SheetStepProps) {
  if (step.kind === 'question') {
    return <QuestionStep step={step} imageUrl={imageUrl} color={color} onPick={onPick} />;
  }
  if (step.kind === 'text') {
    // R-001-07: the support text as in the original, only split into paragraphs.
    return (
      <div className="space-y-3 rounded-lg border-2 border-slate-300 p-4 leading-relaxed">
        {step.text.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <KeywordPictograms stepId={step.id} keywords={step.keywords} color={color} onPick={onPick} />
      <p className="text-lg font-semibold">{step.text}</p>
    </div>
  );
}
