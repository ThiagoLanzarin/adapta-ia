// The only place that talks to the server (docs/arquitetura.md, section 4).
import type { ErrorCode, ErrorResponse } from '@/shared/types/contract';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** A bit longer than the server's 90 s AI timeout (R-001-09). */
const TIMEOUT_MS = 100_000;

export type ClientErrorCode = ErrorCode | 'NETWORK' | 'UNKNOWN';

/** Error with a message in Portuguese, ready to show to the teacher (constitution E7). */
export class ApiError extends Error {
  readonly code: ClientErrorCode;

  constructor(code: ClientErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const NETWORK_MESSAGE =
  'Não consegui falar com o servidor. Confira a internet e tente de novo em alguns segundos.';
const UNKNOWN_MESSAGE = 'Algo deu errado. Tente de novo.';

function isErrorResponse(body: unknown): body is ErrorResponse {
  return typeof body === 'object' && body !== null && 'code' in body && 'message' in body;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError('NETWORK', NETWORK_MESSAGE);
  }

  const body: unknown = await response.json().catch(() => null);
  if (response.ok) {
    return body as T;
  }
  if (isErrorResponse(body)) {
    throw new ApiError(body.code, body.message);
  }
  throw new ApiError('UNKNOWN', UNKNOWN_MESSAGE);
}
