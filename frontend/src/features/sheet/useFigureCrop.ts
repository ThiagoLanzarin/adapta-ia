import { useEffect, useState } from 'react';

import type { FigureBox } from '@/shared/types/contract';

/** About 0.5% of margin around the box (R-001-08): enough not to cut the figure. */
const MARGIN = 5;

function clamp(value: number): number {
  return Math.min(1000, Math.max(0, value));
}

/** Crops the figure out of the original photo, in the browser (no library, no server). */
export function useFigureCrop(imageUrl: string | null, box: FigureBox | null): string | null {
  const [cropUrl, setCropUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl || !box) return;
    let active = true;
    const image = new Image();
    image.onload = () => {
      const [yMin, xMin, yMax, xMax] = box;
      const left = (clamp(xMin - MARGIN) / 1000) * image.naturalWidth;
      const top = (clamp(yMin - MARGIN) / 1000) * image.naturalHeight;
      const width = (clamp(xMax + MARGIN) / 1000) * image.naturalWidth - left;
      const height = (clamp(yMax + MARGIN) / 1000) * image.naturalHeight - top;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      canvas
        .getContext('2d')
        ?.drawImage(image, left, top, width, height, 0, 0, canvas.width, canvas.height);
      if (active) setCropUrl(canvas.toDataURL('image/png'));
    };
    image.src = imageUrl;
    return () => {
      active = false;
    };
  }, [imageUrl, box]);

  return imageUrl && box ? cropUrl : null;
}
