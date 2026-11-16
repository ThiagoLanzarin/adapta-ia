import { request } from '@/shared/api/client';

export type AiProviderName = 'gemini' | 'fake' | 'replay' | 'custom';

export interface Health {
  online: boolean;
  aiProvider: AiProviderName | null;
}

export async function checkHealth(): Promise<Health> {
  try {
    const body = await request<{ status: string; aiProvider?: AiProviderName }>('/health');
    return { online: body.status === 'ok', aiProvider: body.aiProvider ?? null };
  } catch {
    return { online: false, aiProvider: null };
  }
}
