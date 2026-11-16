import type { StoredOriginal } from '@/shared/storage/history';
import type { OriginalMaterial } from '@/shared/types/original';

/** The object URL is not stored: it only lives while the page is open. */
export function toStoredOriginal(original: OriginalMaterial): StoredOriginal {
  return original.kind === 'image' ? { kind: 'image', image: original.image } : original;
}

/** For an image, the caller revokes the URL when leaving the page. */
export function toOriginal(stored: StoredOriginal): OriginalMaterial {
  return stored.kind === 'image'
    ? { kind: 'image', image: stored.image, url: URL.createObjectURL(stored.image) }
    : stored;
}
