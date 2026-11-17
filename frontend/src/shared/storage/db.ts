// The only place that opens the IndexedDB (docs/arquitetura.md, section 4). R-003-01 and
// R-007-01: profiles and history stay in this browser; nothing goes to the server.
import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

import type { HistoryEntry } from './historyTypes';
import type { SavedProfile } from './profileTypes';

const DB_NAME = 'adapta-ai';
const DB_VERSION = 2;

interface AdaptaDb extends DBSchema {
  history: { key: string; value: HistoryEntry };
  profiles: { key: string; value: SavedProfile };
}

/** Message for the teacher when the browser storage fails (specs 003 and 007). */
export class StorageError extends Error {}

const FULL_MESSAGE = 'Não há espaço para salvar. Apague adaptações antigas.';

let database: Promise<IDBPDatabase<AdaptaDb>> | null = null;

export function openDatabase(): Promise<IDBPDatabase<AdaptaDb>> {
  database ??= openDB<AdaptaDb>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Each version only adds what is new, so an older browser database is kept.
      if (oldVersion < 1) db.createObjectStore('history', { keyPath: 'id' });
      if (oldVersion < 2) db.createObjectStore('profiles', { keyPath: 'id' });
    },
  }).catch((error: unknown) => {
    database = null;
    throw error;
  });
  return database;
}

/** Asks the browser not to erase this site's data when the disk is full. Best effort: some
 * browsers decide alone or ask the user; the answer does not change anything else. */
export function requestPersistentStorage(): void {
  void navigator.storage?.persist?.().catch(() => undefined);
}

/** Runs a storage action; any failure becomes a StorageError with a message to show. */
export async function runStorage<T>(blockedMessage: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof StorageError) throw error;
    const full = error instanceof DOMException && error.name === 'QuotaExceededError';
    throw new StorageError(full ? FULL_MESSAGE : blockedMessage);
  }
}
