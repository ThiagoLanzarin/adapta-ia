import type { Step } from '@/shared/types/contract';

import EditableText from './EditableText';
import type { SheetActions } from './editAdaptation';
import KeywordPictograms from './KeywordPictograms';
import { useFigureCrop } from './useFigureCrop';

/** Place of the question among the questions of the sheet, counted from 1. */
export interface QuestionPosition {
  index: number;
  total: number;
}

/** CA-001-33: "Questão 2 de 5"; when the original number differs, "Questão 4a (2 de 5)". */
function questionLabel(sourceNumber: string | null, { index, total }: QuestionPosition): string {
  if (!sourceNumber || sourceNumber === String(index)) return `Questão ${index} de ${total}`;
  return `Questão ${sourceNumber} (${index} de ${total})`;
}

interface QuestionStepProps {
  step: Step;
  position: QuestionPosition;
  imageUrl: string | null;
  color: boolean;
  actions: SheetActions;
}

/** CA-001-24: "Questão N" with the original number, every option, pictograms only in the
 * statement. CA-001-28: the figure cropped from the photo, next to the question. */
export default function QuestionStep({
  step,
  position,
  imageUrl,
  color,
  actions,
}: QuestionStepProps) {
  const figureUrl = useFigureCrop(imageUrl, step.figureBox);
  const name = `questão ${step.sourceNumber ?? ''}`.trim();

  return (
    <div className="break-inside-avoid space-y-3">
      <p className="text-sm font-bold uppercase tracking-wide text-teal-800">
        {questionLabel(step.sourceNumber, position)}
      </p>
      <div className="flex items-start gap-4">
        <KeywordPictograms
          stepId={step.id}
          keywords={step.keywords}
          color={color}
          onPick={actions.pickPictogram}
        />
        <EditableText
          value={step.text}
          label={`enunciado da ${name}`}
          onSave={(text) => actions.editText(step.id, text)}
        >
          <p className="text-lg">{step.text}</p>
        </EditableText>
      </div>
      {figureUrl && (
        <div className="flex flex-wrap items-end gap-3">
          <img
            src={figureUrl}
            alt={`Figura da ${name}`}
            className="w-64 max-w-full rounded border border-slate-200"
          />
          <button
            type="button"
            onClick={() => actions.removeFigure(step.id)}
            className="rounded-lg bg-red-50 px-3 py-1 text-sm text-red-800 print:hidden"
          >
            Remover figura
          </button>
        </div>
      )}
      {step.options.length > 0 ? (
        <ul className="space-y-2">
          {step.options.map((option, index) => (
            <li key={index} className="rounded-lg border border-slate-300 px-4 py-2 text-lg">
              <EditableText
                value={option}
                label={`alternativa ${index + 1} da ${name}`}
                onSave={(text) => actions.editOption(step.id, index, text)}
              >
                {option}
              </EditableText>
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
