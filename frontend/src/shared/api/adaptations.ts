import { request } from '@/shared/api/client';
import type { Adaptation, MaterialType, StudentProfile } from '@/shared/types/contract';

export interface AdaptationInput {
  materialType: MaterialType;
  profile: StudentProfile;
  text?: string;
  image?: Blob;
}

/** POST /api/adaptations (docs/arquitetura.md, section 10). Text or image, never both. */
export function createAdaptation(input: AdaptationInput): Promise<Adaptation> {
  const form = new FormData();
  form.append('materialType', input.materialType);
  form.append('profile', JSON.stringify(input.profile));
  if (input.image) {
    form.append('file', input.image, 'prova.jpg');
  } else {
    form.append('text', input.text ?? '');
  }
  return request<Adaptation>('/api/adaptations', { method: 'POST', body: form });
}
