import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { toOriginal, useSavedEntry } from '@/features/history';
import type { HistoryEntry } from '@/shared/storage/history';
import PageTitle from '@/shared/ui/PageTitle';

import AdaptationWorkspace from './AdaptationWorkspace';

/** CA-007-04: a saved adaptation, reopened to keep editing and print. */
export default function SavedAdaptationPage() {
  const { id = '' } = useParams();
  const state = useSavedEntry(id);

  if (state.status === 'loading') return <p className="text-slate-600">Abrindo a adaptação...</p>;
  if (state.status !== 'ready') {
    return (
      <section className="space-y-4">
        <PageTitle title="Adaptação não encontrada" />
        <p role="alert">
          {state.status === 'error'
            ? state.message
            : 'Esta adaptação não está mais no histórico deste navegador.'}
        </p>
        <Link to="/historico" className="font-semibold text-brand-700 underline">
          Voltar ao histórico
        </Link>
      </section>
    );
  }
  return <Reopened entry={state.entry} />;
}

function Reopened({ entry }: { entry: HistoryEntry }) {
  const navigate = useNavigate();
  const original = useMemo(() => toOriginal(entry.original), [entry.original]);

  useEffect(
    () => () => {
      if (original.kind === 'image') URL.revokeObjectURL(original.url);
    },
    [original],
  );

  return (
    <AdaptationWorkspace
      key={entry.id}
      initial={entry}
      original={original}
      onNew={() => navigate('/adaptar')}
    />
  );
}
