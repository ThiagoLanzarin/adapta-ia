// The profiles file (spec 003, R-003-04): a backup to keep or to take to another computer.
// Nothing goes to the server: the file is made and read in this browser.
import { NOTES_MAX_LENGTH, SUPPORT_OPTIONS } from '@/shared/profile/supportOptions';
import { NICKNAME_MAX_LENGTH, type SavedProfile } from '@/shared/storage/profiles';

const APP = 'adapta-ai';
const KIND = 'perfis';
const VERSION = 1;

export const INVALID_FILE_MESSAGE =
  'Este arquivo não é uma cópia de perfis do Adapta Aí. Escolha o arquivo exportado nesta página.';

export function profilesFileName(today: Date = new Date()): string {
  return `perfis-adapta-ai-${today.toISOString().slice(0, 10)}.json`;
}

export function profilesToFile(profiles: SavedProfile[]): Blob {
  const body = { app: APP, kind: KIND, version: VERSION, profiles };
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** One profile, rebuilt field by field: anything else in the file is dropped. */
function readProfile(value: unknown): SavedProfile {
  if (!isRecord(value)) throw new Error(INVALID_FILE_MESSAGE);
  const { id, nickname, notes } = value;
  const validNickname =
    typeof nickname === 'string' &&
    nickname.trim() !== '' &&
    nickname.length <= NICKNAME_MAX_LENGTH;
  const validNotes =
    notes === undefined || (typeof notes === 'string' && notes.length <= NOTES_MAX_LENGTH);
  if (typeof id !== 'string' || id === '' || !validNickname || !validNotes) {
    throw new Error(INVALID_FILE_MESSAGE);
  }
  const profile: SavedProfile = {
    id,
    nickname,
    notes: typeof notes === 'string' ? notes : '',
  } as SavedProfile;
  for (const { key } of SUPPORT_OPTIONS) {
    // Options the file does not know (an older file) come unmarked.
    profile[key] = value[key] === true;
  }
  return profile;
}

/** CA-003-08: the profiles in the file, or an error with a message for the teacher. */
export function parseProfilesFile(text: string): SavedProfile[] {
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(INVALID_FILE_MESSAGE);
  }
  if (!isRecord(body) || body.app !== APP || body.kind !== KIND || !Array.isArray(body.profiles)) {
    throw new Error(INVALID_FILE_MESSAGE);
  }
  return body.profiles.map(readProfile);
}
