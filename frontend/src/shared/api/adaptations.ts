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
