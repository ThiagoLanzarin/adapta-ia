import type { Adaptation, Keyword } from '@/shared/types/contract';

/** Where a keyword is in the sheet: the step and its position in that step. */
export interface KeywordRef {
  stepId: string;
  index: number;
}

/** R-004-01: edits change the Adaptation held by the screen. Returns a new object. */
export function setPictogram(
  adaptation: Adaptation,
  ref: KeywordRef,
  pictogramId: number | null,
): Adaptation {
  return {
    ...adaptation,
    steps: adaptation.steps.map((step) =>
      step.id !== ref.stepId
        ? step
        : {
            ...step,
            keywords: step.keywords.map((keyword, index): Keyword =>
              index === ref.index ? { ...keyword, pictogramId } : keyword,
            ),
          },
    ),
  };
}
