import { openDatabase, runStorage } from './db';
import type { HistoryEntry } from './historyTypes';

export { StorageError } from './db';
export type { HistoryEntry, StoredOriginal } from './historyTypes';

const BLOCKED_MESSAGE =
  'Este navegador não deixa salvar o histórico. Imprima ou salve em PDF antes de sair.';

const run = <T>(action: () => Promise<T>) => runStorage(BLOCKED_MESSAGE, action);

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
