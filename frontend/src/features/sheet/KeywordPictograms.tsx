import { pictogramUrl } from '@/shared/pictograms';
import type { Keyword } from '@/shared/types/contract';

interface KeywordPictogramsProps {
  keywords: Keyword[];
  color: boolean;
}

/** Pictograms with their word as caption (RF-06). Words without a pictogram are skipped. */
export default function KeywordPictograms({ keywords, color }: KeywordPictogramsProps) {
  const withImage = keywords.filter((keyword) => keyword.pictogramId !== null);
  if (withImage.length === 0) return null;
  return (
    <div className="flex shrink-0 gap-3">
      {withImage.map((keyword) => (
        <figure key={keyword.word} className="w-20 text-center">
          <img
            src={pictogramUrl(keyword.pictogramId as number, color)}
            alt={keyword.word}
            className="mx-auto size-20 object-contain"
            loading="eager"
          />
          <figcaption className="text-sm">{keyword.word}</figcaption>
        </figure>
      ))}
    </div>
  );
}
