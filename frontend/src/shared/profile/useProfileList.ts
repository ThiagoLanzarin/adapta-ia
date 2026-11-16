import { useCallback, useEffect, useState } from 'react';

import { listProfiles, type SavedProfile } from '@/shared/storage/profiles';

/** The profiles saved in this browser. Shared by the profiles page and the adaptation form,
 * because one feature does not import another. */
export function useProfileList() {
  const [profiles, setProfiles] = useState<SavedProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setProfiles(await listProfiles());
      setError(null);
    } catch (caught) {
      setProfiles([]);
      setError((caught as Error).message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listProfiles().then(
      (list) => {
        if (active) setProfiles(list);
      },
      (caught: unknown) => {
        if (!active) return;
        setProfiles([]);
        setError((caught as Error).message);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return { profiles, error, setError, reload };
}
