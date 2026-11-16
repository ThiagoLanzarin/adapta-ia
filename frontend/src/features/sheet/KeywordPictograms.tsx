import { pictogramUrl } from '@/shared/pictograms';
import type { Keyword } from '@/shared/types/contract';

import type { KeywordRef } from './editAdaptation';

interface KeywordPictogramsProps {
  stepId: string;
  keywords: Keyword[];
  color: boolean;
  onPick: (ref: KeywordRef) => void;
}

/** Pictograms with their word as caption (RF-06). Words without a pictogram are skipped.
 * Each one is a button that opens the swap window (CA-004-21). */
export default function KeywordPictograms({
  stepId,
  keywords,
  color,
  onPick,
}: KeywordPictogramsProps) {
  const withImage = keywords
    .map((keyword, index) => ({ keyword, index }))
    .filter(({ keyword }) => keyword.pictogramId !== null);
  if (withImage.length === 0) return null;
  return (
    <div className="flex shrink-0 gap-3">
      {withImage.map(({ keyword, index }) => (
        <button
          key={`${keyword.word}-${index}`}
          type="button"
          onClick={() => onPick({ stepId, index })}
          title="Trocar ou remover o pictograma"
          className="w-20 rounded-lg text-center hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
        >
          <img
            src={pictogramUrl(keyword.pictogramId as number, color)}
            alt={keyword.word}
            className="mx-auto size-20 object-contain"
            loading="eager"
          />
          <span className="block text-sm">{keyword.word}</span>
        </button>
      ))}
    </div>
  );
}
