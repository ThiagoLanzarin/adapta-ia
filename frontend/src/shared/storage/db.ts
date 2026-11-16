// The only place that opens the IndexedDB (docs/arquitetura.md, section 4). R-007-01: the
// history stays in this browser; nothing goes to the server.
import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

import type { HistoryEntry } from './historyTypes';

const DB_NAME = 'adapta-ai';
const DB_VERSION = 1;

interface AdaptaDb extends DBSchema {
  history: { key: string; value: HistoryEntry };
}

/** Message for the teacher when saving fails (spec 007, "Erros e casos de borda"). */
export class StorageError extends Error {}

const BLOCKED_MESSAGE =
  'Este navegador não deixa salvar o histórico. Imprima ou salve em PDF antes de sair.';
const FULL_MESSAGE = 'Não há espaço para salvar. Apague adaptações antigas.';

let database: Promise<IDBPDatabase<AdaptaDb>> | null = null;

export function openDatabase(): Promise<IDBPDatabase<AdaptaDb>> {
  database ??= openDB<AdaptaDb>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Each new version adds its stores here (T18 adds the profiles).
      if (oldVersion < 1) db.createObjectStore('history', { keyPath: 'id' });
    },
  }).catch((error: unknown) => {
    database = null;
    throw toStorageError(error);
  });
  return database;
}

export function toStorageError(error: unknown): StorageError {
  if (error instanceof StorageError) return error;
  const full = error instanceof DOMException && error.name === 'QuotaExceededError';
  return new StorageError(full ? FULL_MESSAGE : BLOCKED_MESSAGE);
}
