import { request } from '@/shared/api/client';
import type { PictogramSearch } from '@/shared/types/contract';

/** GET /api/pictograms (spec 004): up to 10 ARASAAC ids, best first. Empty list if none. */
export async function searchPictograms(query: string): Promise<number[]> {
  const params = new URLSearchParams({ q: query });
  const body = await request<PictogramSearch>(`/api/pictograms?${params.toString()}`);
  return body.results.map((result) => result.id);
}
