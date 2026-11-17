import { request } from '@/shared/api/client';
import type { Adaptation, MaterialType, Slide, StudentProfile } from '@/shared/types/contract';

export interface AdaptationInput {
  materialType: MaterialType;
  profile: StudentProfile;
  text?: string;
  image?: Blob;
  slides?: Slide[];
}

/** POST /api/adaptations (docs/arquitetura.md, section 10). Text, image or slides: only one. */
export function createAdaptation(input: AdaptationInput): Promise<Adaptation> {
  const form = new FormData();
  form.append('materialType', input.materialType);
  form.append('profile', JSON.stringify(input.profile));
  if (input.image) {
    form.append('file', input.image, 'prova.jpg');
  } else if (input.slides) {
    form.append('slides', JSON.stringify(input.slides));
  } else {
    form.append('text', input.text ?? '');
  }
  return request<Adaptation>('/api/adaptations', { method: 'POST', body: form });
}

export interface RevisionInput {
  adaptation: Adaptation;
  profile: StudentProfile;
  instruction: string;
}

/** POST /api/adaptations/revise (spec 005): a new version of the current sheet, with the
 * teacher's edits, following the request. */
export function reviseAdaptation(input: RevisionInput): Promise<Adaptation> {
  const body = {
    adaptation: input.adaptation,
    profile: input.profile,
    materialType: input.adaptation.materialType,
    instruction: input.instruction,
  };
  return request<Adaptation>('/api/adaptations/revise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
