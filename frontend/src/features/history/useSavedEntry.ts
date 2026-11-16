import { useEffect, useState } from 'react';

import { getHistoryEntry, type HistoryEntry } from '@/shared/storage/history';

export type SavedEntryState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; entry: HistoryEntry };

/** CA-007-04: one saved entry, to reopen it. */
export function useSavedEntry(id: string): SavedEntryState {
  const [state, setState] = useState<SavedEntryState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getHistoryEntry(id).then(
      (entry) => {
        if (active) setState(entry ? { status: 'ready', entry } : { status: 'missing' });
      },
      (caught: unknown) => {
        if (active) setState({ status: 'error', message: (caught as Error).message });
      },
    );
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
