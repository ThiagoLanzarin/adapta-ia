import { useState } from 'react';

import { AdaptationForm } from '@/features/adaptation';
import { toStoredOriginal } from '@/features/history';
import type { HistoryEntry } from '@/shared/storage/history';
import type { OriginalMaterial } from '@/shared/types/original';
import PageTitle from '@/shared/ui/PageTitle';

import AdaptationWorkspace from './AdaptationWorkspace';

interface Result {
  entry: HistoryEntry;
  original: OriginalMaterial;
}

/** Composes the form (adaptation) and, once adapted, the sheet saved in the history. */
export default function AdaptationPage() {
  const [result, setResult] = useState<Result | null>(null);

  if (result) {
    return (
      <AdaptationWorkspace
        key={result.entry.id}
        initial={result.entry}
        original={result.original}
        onNew={() => setResult(null)}
      />
    );
  }
  return (
    <section>
      <PageTitle
        eyebrow="Nova adaptação"
        title="Adaptar material"
        subtitle="Escolha o tipo, marque o que ajuda o aluno e envie a prova em branco."
      />
      <AdaptationForm
        onDone={(adaptation, original, profile) => {
          const now = new Date().toISOString();
          // CA-007-01: saved right away, named after the sheet title.
          const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            name: adaptation.title,
            createdAt: now,
            updatedAt: now,
            profile,
            original: toStoredOriginal(original),
            adaptation,
          };
          setResult({ entry, original });
        }}
      />
    </section>
  );
}
