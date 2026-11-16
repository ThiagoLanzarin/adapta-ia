import { request } from '@/shared/api/client';
import type { Slide, SlideList } from '@/shared/types/contract';

/** POST /api/slides (spec 002): the slides of a .pptx. The server keeps no file (R-002-02). */
export async function listSlides(file: File): Promise<Slide[]> {
  const form = new FormData();
  form.append('file', file, file.name);
  const body = await request<SlideList>('/api/slides', { method: 'POST', body: form });
  return body.slides;
}
