import { useState } from 'react';

import { AdaptationForm } from '@/features/adaptation';
import { AdaptationResult } from '@/features/sheet';
import type { Adaptation, StudentProfile } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';
import PageTitle from '@/shared/ui/PageTitle';

interface Result {
  adaptation: Adaptation;
  original: OriginalMaterial;
  profile: StudentProfile;
}

/** Composes the two features: the form (adaptation) and the result (sheet). */
export default function AdaptationPage() {
  const [result, setResult] = useState<Result | null>(null);

  if (result) {
    return (
      <AdaptationResult
        adaptation={result.adaptation}
        original={result.original}
        onNew={() => setResult(null)}
      />
    );
  }
  return (
    <section>
      <PageTitle
        title="Adaptar material"
        subtitle="Escolha o tipo, marque o que ajuda o aluno e envie a prova em branco."
      />
      <AdaptationForm
        onDone={(adaptation, original, profile) => setResult({ adaptation, original, profile })}
      />
    </section>
  );
}
