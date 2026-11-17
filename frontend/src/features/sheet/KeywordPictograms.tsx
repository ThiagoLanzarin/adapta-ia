import { pictogramUrl } from '@/shared/pictograms';
import type { Keyword } from '@/shared/types/contract';

import type { KeywordRef } from './editAdaptation';

interface KeywordPictogramsProps {
  stepId: string;
  keywords: Keyword[];
  color: boolean;
  onPick: (ref: KeywordRef) => void;
}

const BUTTON_CLASS =
  'w-20 rounded-xl p-0.5 text-center transition-colors hover:bg-brand-50 hover:ring-2 hover:ring-brand-200';

/** Pictograms with their word as caption (RF-06). Each one is a button that opens the swap
 * window (CA-004-21). A word left without a picture (R-001-10: wrong or ambiguous, or removed by
 * the teacher) shows on screen only, as "+ word", so the teacher can choose one (CA-004-27). */
export default function KeywordPictograms({
  stepId,
  keywords,
  color,
  onPick,
}: KeywordPictogramsProps) {
  if (keywords.length === 0) return null;
  const allWithoutImage = keywords.every((keyword) => keyword.pictogramId === null);
  return (
    <div className={`flex shrink-0 gap-3 ${allWithoutImage ? 'print:hidden' : ''}`}>
      {keywords.map((keyword, index) =>
        keyword.pictogramId === null ? (
          <button
            key={`${keyword.word}-${index}`}
            type="button"
            onClick={() => onPick({ stepId, index })}
            title="Escolher um pictograma"
            className={`${BUTTON_CLASS} flex size-20 flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-800 print:hidden`}
          >
            <span aria-hidden="true" className="text-2xl leading-none">
              +
            </span>
            <span className="block text-sm">{keyword.word}</span>
          </button>
        ) : (
          <button
            key={`${keyword.word}-${index}`}
            type="button"
            onClick={() => onPick({ stepId, index })}
            title="Trocar ou remover o pictograma"
            className={BUTTON_CLASS}
          >
            <img
              src={pictogramUrl(keyword.pictogramId, color)}
              alt={keyword.word}
              className="mx-auto size-20 object-contain"
              loading="eager"
            />
            <span className="block text-sm">{keyword.word}</span>
          </button>
        ),
      )}
    </div>
  );
}
