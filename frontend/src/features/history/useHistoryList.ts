import { useCallback, useEffect, useState } from 'react';

import { deleteHistoryEntry, type HistoryEntry, listHistory } from '@/shared/storage/history';

/** The saved entries, most recent first, and a way to delete one. */
export function useHistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listHistory().then(
      (list) => {
        if (active) setEntries(list);
      },
      (caught: unknown) => {
        if (!active) return;
        setEntries([]);
        setError((caught as Error).message);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setEntries((list) => list?.filter((entry) => entry.id !== id) ?? null);
    } catch (caught) {
      setError((caught as Error).message);
    }
  }, []);

  return { entries, error, remove };
}
