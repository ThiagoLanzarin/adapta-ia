import type { Step } from '@/shared/types/contract';

import type { KeywordRef } from './editAdaptation';
import KeywordPictograms from './KeywordPictograms';
import { useFigureCrop } from './useFigureCrop';

interface QuestionStepProps {
  step: Step;
  imageUrl: string | null;
  color: boolean;
  onPick: (ref: KeywordRef) => void;
}

/** CA-001-24: "Questão N" with the original number, every option, pictograms only in the
 * statement. CA-001-28: the figure cropped from the photo, next to the question. */
export default function QuestionStep({ step, imageUrl, color, onPick }: QuestionStepProps) {
  const figureUrl = useFigureCrop(imageUrl, step.figureBox);

  return (
    <div className="break-inside-avoid space-y-3">
      <p className="text-sm font-bold uppercase tracking-wide text-teal-800">
        Questão {step.sourceNumber}
      </p>
      <div className="flex items-start gap-4">
        <KeywordPictograms
          stepId={step.id}
          keywords={step.keywords}
          color={color}
          onPick={onPick}
        />
        <p className="text-lg">{step.text}</p>
      </div>
      {figureUrl && (
        <img
          src={figureUrl}
          alt={`Figura da questão ${step.sourceNumber}`}
          className="w-64 max-w-full rounded border border-slate-200 [image-rendering:auto]"
        />
      )}
      {step.options.length > 0 ? (
        <ul className="space-y-2">
          {step.options.map((option) => (
            <li key={option} className="rounded-lg border border-slate-300 px-4 py-2 text-lg">
              {option}
            </li>
          ))}
        </ul>
      ) : (
        <div aria-hidden className="space-y-6 pt-4">
          <div className="border-b border-slate-400" />
          <div className="border-b border-slate-400" />
        </div>
      )}
    </div>
  );
}
