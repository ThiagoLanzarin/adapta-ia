import { useState } from 'react';

import { AdaptationForm } from '@/features/adaptation';
import type { Adaptation, StudentProfile } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';
import PageTitle from '@/shared/ui/PageTitle';

interface Result {
  adaptation: Adaptation;
  original: OriginalMaterial;
  profile: StudentProfile;
}

export default function AdaptationPage() {
  const [result, setResult] = useState<Result | null>(null);

  if (!result) {
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

  // Temporary summary until the sheet arrives (T12).
  const { adaptation } = result;
  const questions = adaptation.steps.filter((step) => step.kind === 'question').length;
  return (
    <section className="space-y-4">
      <PageTitle title={adaptation.title} subtitle={adaptation.objective} />
      <p>
        {adaptation.steps.length} etapas, {questions} questões. A folha completa chega na próxima
        tarefa (T12).
      </p>
      {adaptation.warnings.map((warning) => (
        <p key={warning.message} className="rounded-lg bg-amber-50 p-3 text-amber-900">
          {warning.message}
        </p>
      ))}
      <button
        type="button"
        onClick={() => setResult(null)}
        className="rounded-lg bg-slate-200 px-4 py-2"
      >
        Adaptar outro material
      </button>
    </section>
  );
}
