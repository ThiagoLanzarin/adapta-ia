import { useEffect, useState } from 'react';

import { checkHealth, type AiProviderName } from '@/shared/api/health';

export type ServerStatus = 'checking' | 'online' | 'offline';

export interface ServerState {
  status: ServerStatus;
  aiProvider: AiProviderName | null;
}

/** Wakes the server up and reports whether it answers (useful on Render's free plan). */
export function useServerStatus(): ServerState {
  const [state, setState] = useState<ServerState>({ status: 'checking', aiProvider: null });

  useEffect(() => {
    let active = true;
    checkHealth().then((health) => {
      if (active) {
        setState({ status: health.online ? 'online' : 'offline', aiProvider: health.aiProvider });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
