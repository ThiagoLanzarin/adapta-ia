import { useState } from 'react';

import { HistoryNameField, useAutoSave } from '@/features/history';
import { AdaptationResult } from '@/features/sheet';
import type { HistoryEntry } from '@/shared/storage/history';
import type { OriginalMaterial } from '@/shared/types/original';

interface AdaptationWorkspaceProps {
  initial: HistoryEntry;
  original: OriginalMaterial;
  onNew: () => void;
}

/** Composes the sheet (spec 004) and the history (spec 007) for one adaptation, new or
 * reopened: every change is saved in this browser. Not a route; used by two pages. */
export default function AdaptationWorkspace({
  initial,
  original,
  onNew,
}: AdaptationWorkspaceProps) {
  const [entry, setEntry] = useState(initial);
  const saveError = useAutoSave(entry);

  const update = (change: Partial<HistoryEntry>) =>
    setEntry((current) => ({ ...current, ...change, updatedAt: new Date().toISOString() }));

  return (
    <div className="space-y-6">
      <HistoryNameField name={entry.name} onChange={(name) => update({ name })} error={saveError} />
      <AdaptationResult
        adaptation={entry.adaptation}
        original={original}
        onePerPage={entry.profile.easilyDistracted}
        onChange={(adaptation) => update({ adaptation })}
        onNew={onNew}
      />
    </div>
  );
}
