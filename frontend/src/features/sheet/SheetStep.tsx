import type { Step } from '@/shared/types/contract';

import EditableText from './EditableText';
import type { SheetActions } from './editAdaptation';
import KeywordPictograms from './KeywordPictograms';
import QuestionStep, { type QuestionPosition } from './QuestionStep';

interface SheetStepProps {
  step: Step;
  position: QuestionPosition;
  imageUrl: string | null;
  color: boolean;
  actions: SheetActions;
}

/** One step of the sheet, by kind: instruction, support text or question. */
export default function SheetStep({ step, position, imageUrl, color, actions }: SheetStepProps) {
  const save = (text: string) => actions.editText(step.id, text);

  if (step.kind === 'question') {
    return (
      <QuestionStep
        step={step}
        position={position}
        imageUrl={imageUrl}
        color={color}
        actions={actions}
      />
    );
  }
  if (step.kind === 'text') {
    // R-001-07: the support text as in the original, only split into paragraphs.
    return (
      <div className="rounded-lg border-2 border-slate-300 p-4 leading-relaxed">
        <EditableText value={step.text} label="texto de apoio" onSave={save} multiline>
          <span className="block space-y-3">
            {step.text.split(/\n{2,}/).map((paragraph, index) => (
              <span key={index} className="block whitespace-pre-line">
                {paragraph}
              </span>
            ))}
          </span>
        </EditableText>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <KeywordPictograms
        stepId={step.id}
        keywords={step.keywords}
        color={color}
        onPick={actions.pickPictogram}
      />
      <EditableText value={step.text} label="instrução" onSave={save}>
        <p className="text-lg font-semibold">{step.text}</p>
      </EditableText>
    </div>
  );
}
