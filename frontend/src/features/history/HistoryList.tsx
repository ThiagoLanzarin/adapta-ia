import { useState } from 'react';
import { Link } from 'react-router';

import { MATERIAL_TYPES } from '@/shared/profile/supportOptions';
import type { HistoryEntry } from '@/shared/storage/history';
import Alert from '@/shared/ui/Alert';
import EmptyState from '@/shared/ui/EmptyState';
import Icon, { type IconName } from '@/shared/ui/Icon';
import { buttonClass, CARD_CLASS, INPUT_CLASS } from '@/shared/ui/styles';

import { normalizeForSearch } from './searchText';
import { useHistoryList } from './useHistoryList';

const ORIGINS: Record<HistoryEntry['original']['kind'], { label: string; icon: IconName }> = {
  image: { label: 'foto', icon: 'camera' },
  text: { label: 'texto colado', icon: 'text' },
  slides: { label: 'PowerPoint', icon: 'slides' },
};

/** CA-007-02: type of material, where it came from and the date. */
function describe(entry: HistoryEntry): string {
  const type = MATERIAL_TYPES.find((option) => option.value === entry.adaptation.materialType);
  const date = new Date(entry.updatedAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const typeName = type ? type.label.split(' (')[0] : '';
  return `${typeName} (${ORIGINS[entry.original.kind].label}) · ${date}`;
}

/** Spec 007: search, reopen and delete the adaptations saved in this browser. */
export default function HistoryList() {
  const { entries, error, remove } = useHistoryList();
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  if (entries === null) return <p className="text-slate-600">Carregando o histórico...</p>;

  const wanted = normalizeForSearch(query);
  const shown = entries.filter((entry) => normalizeForSearch(entry.name).includes(wanted));

  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {entries.length === 0 && !error && (
        <EmptyState
          icon="clock"
          title="Nenhuma adaptação salva ainda"
          action={
            <Link to="/adaptar" className={buttonClass('primary', 'md')}>
              <Icon name="sparkles" />
              Adaptar um material
            </Link>
          }
        >
          Toda folha que você adaptar fica guardada aqui, para editar e imprimir de novo.
        </EmptyState>
      )}
      {entries.length > 0 && (
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar pelo nome"
            aria-label="Buscar pelo nome"
            className={`${INPUT_CLASS} pl-11`}
          />
        </div>
      )}
      {entries.length > 0 && shown.length === 0 && (
        <p className="py-6 text-center text-slate-600">Nenhuma adaptação com esse nome.</p>
      )}
      <ul className="grid gap-3">
        {shown.map((entry) => (
          <li
            key={entry.id}
            className={`${CARD_CLASS} group relative flex flex-wrap items-center gap-4 p-4 transition-shadow hover:shadow-paper`}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name={ORIGINS[entry.original.kind].icon} className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              {/* The whole card opens the adaptation; the delete buttons stay above it. */}
              <Link
                to={`/historico/${entry.id}`}
                className="block truncate font-semibold text-slate-900 group-hover:text-brand-800 after:absolute after:inset-0 after:rounded-2xl"
              >
                {entry.name.trim() || 'Sem nome'}
              </Link>
              <p className="text-sm text-slate-600">{describe(entry)}</p>
            </div>
            {/* CA-007-06: delete only after confirming. */}
            {confirming === entry.id ? (
              <div className="animate-fade-in relative flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-red-900">Apagar de vez?</span>
                <button
                  type="button"
                  onClick={() => void remove(entry.id)}
                  className={buttonClass('danger', 'sm')}
                >
                  Sim, apagar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className={buttonClass('secondary', 'sm')}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setConfirming(entry.id)}
                  className={buttonClass('dangerSoft', 'sm')}
                >
                  <Icon name="trash" className="size-4" />
                  Apagar
                </button>
                <Icon
                  name="arrowRight"
                  className="size-5 text-slate-300 transition-colors group-hover:text-brand-600"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
