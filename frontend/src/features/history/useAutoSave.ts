import { useEffect, useState } from 'react';

import { type HistoryEntry, saveHistoryEntry } from '@/shared/storage/history';

/** CA-007-01, CA-007-05: every version of the entry is saved; returns the error to show. */
export function useAutoSave(entry: HistoryEntry): string | null {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    saveHistoryEntry(entry).then(
      () => {
        if (active) setError(null);
      },
      (caught: unknown) => {
        if (active) setError((caught as Error).message);
      },
    );
    return () => {
      active = false;
    };
  }, [entry]);

  return error;
}
