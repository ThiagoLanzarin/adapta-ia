import { useEffect, useState } from 'react';

import { checkHealth } from '@/shared/api/health';

export type ServerStatus = 'checking' | 'online' | 'offline';

/** Wakes the server up and reports whether it answers (useful on Render's free plan). */
export function useServerStatus(): ServerStatus {
  const [status, setStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    let active = true;
    checkHealth().then((ok) => {
      if (active) setStatus(ok ? 'online' : 'offline');
    });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
