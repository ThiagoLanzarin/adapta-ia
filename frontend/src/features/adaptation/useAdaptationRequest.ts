import { useEffect, useState } from 'react';

import { createAdaptation, type AdaptationInput } from '@/shared/api/adaptations';
import { ApiError } from '@/shared/api/client';
import type { Adaptation } from '@/shared/types/contract';

export type RequestStatus = 'idle' | 'loading' | 'error';

/** Sends the adaptation and tracks progress, elapsed seconds and the error (CA-001-25). */
export function useAdaptationRequest() {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const submit = async (input: AdaptationInput): Promise<Adaptation | null> => {
    setStatus('loading');
    setError(null);
    setSeconds(0);
    try {
      const adaptation = await createAdaptation(input);
      setStatus('idle');
      return adaptation;
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Algo deu errado. Tente de novo.');
      setStatus('error');
      return null;
    }
  };

  const showError = (message: string) => {
    setError(message);
    setStatus('error');
  };

  return { status, error, seconds, submit, showError };
}
