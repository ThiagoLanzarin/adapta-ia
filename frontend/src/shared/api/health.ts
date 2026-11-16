import { request } from '@/shared/api/client';

export async function checkHealth(): Promise<boolean> {
  try {
    const body = await request<{ status: string }>('/health');
    return body.status === 'ok';
  } catch {
    return false;
  }
}
