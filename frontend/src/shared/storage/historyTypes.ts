import type { Adaptation, Slide, StudentProfile } from '@/shared/types/contract';

/** The original as stored: the reduced image (no object URL, it dies with the page), the
 * text or the chosen slides (R-007-02). */
export type StoredOriginal =
  | { kind: 'image'; image: Blob }
  | { kind: 'text'; text: string }
  | { kind: 'slides'; slides: Slide[] };

/** One saved adaptation (docs/arquitetura.md, section 10, "Guardado só no navegador"). */
export interface HistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  profile: StudentProfile;
  original: StoredOriginal;
  adaptation: Adaptation;
}
