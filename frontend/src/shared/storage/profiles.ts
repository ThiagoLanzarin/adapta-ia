import type { StudentProfile } from '@/shared/types/contract';

import { openDatabase, runStorage } from './db';
import type { SavedProfile } from './profileTypes';

export { StorageError } from './db';
export { NICKNAME_MAX_LENGTH, type SavedProfile } from './profileTypes';

const BLOCKED_MESSAGE =
  'Este navegador não deixa salvar perfis. A adaptação funciona, mas o perfil não fica guardado.';

const run = <T>(action: () => Promise<T>) => runStorage(BLOCKED_MESSAGE, action);

/** Profiles saved before the options of 17/11 have no such fields: they come unmarked. */
function withNewOptions(profile: SavedProfile): SavedProfile {
  const stored: Partial<SavedProfile> = profile;
  return {
    ...profile,
    takesThingsLiterally: stored.takesThingsLiterally ?? false,
    needsPredictability: stored.needsPredictability ?? false,
  };
}

/** In alphabetical order of nickname. */
export function listProfiles(): Promise<SavedProfile[]> {
  return run(async () => {
    const db = await openDatabase();
    const profiles = (await db.getAll('profiles')).map(withNewOptions);
    return profiles.sort((a, b) => a.nickname.localeCompare(b.nickname, 'pt-BR'));
  });
}

/** CA-003-01, CA-003-03: creates or replaces a profile. */
export function saveProfile(profile: SavedProfile): Promise<void> {
  return run(async () => {
    const db = await openDatabase();
    await db.put('profiles', profile);
  });
}

/** CA-003-03. R-003-03: the history keeps its own copy of the profile used. */
export function deleteProfile(id: string): Promise<void> {
  return run(async () => {
    const db = await openDatabase();
    await db.delete('profiles', id);
  });
}

/** R-003-02: what goes to the server. Builds the object field by field, so the nickname and
 * the id can never leak into the request. */
export function toStudentProfile(profile: SavedProfile): StudentProfile {
  return {
    readsLittle: profile.readsLittle,
    needsStepByStep: profile.needsStepByStep,
    needsMoreImages: profile.needsMoreImages,
    sensitiveToVisualClutter: profile.sensitiveToVisualClutter,
    easilyDistracted: profile.easilyDistracted,
    takesThingsLiterally: profile.takesThingsLiterally,
    needsPredictability: profile.needsPredictability,
    notes: profile.notes,
  };
}
