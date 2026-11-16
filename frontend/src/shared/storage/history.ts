import { openDatabase, toStorageError } from './db';
import type { HistoryEntry } from './historyTypes';

export { StorageError } from './db';
export type { HistoryEntry, StoredOriginal } from './historyTypes';

async function run<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw toStorageError(error);
  }
}

/** CA-007-01, CA-007-05: saves a new entry or replaces it with its latest edits. */
export function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  return run(async () => {
    const db = await openDatabase();
    await db.put('history', entry);
  });
}

/** CA-007-02: most recent first. */
export function listHistory(): Promise<HistoryEntry[]> {
  return run(async () => {
    const db = await openDatabase();
    const entries = await db.getAll('history');
    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
}

export function getHistoryEntry(id: string): Promise<HistoryEntry | undefined> {
  return run(async () => {
    const db = await openDatabase();
    return db.get('history', id);
  });
}

/** CA-007-06. */
export function deleteHistoryEntry(id: string): Promise<void> {
  return run(async () => {
    const db = await openDatabase();
    await db.delete('history', id);
  });
}
