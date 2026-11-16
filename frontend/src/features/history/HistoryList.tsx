import { useState } from 'react';
import { Link } from 'react-router';

import { MATERIAL_TYPES } from '@/shared/profile/supportOptions';
import type { HistoryEntry } from '@/shared/storage/history';

import { normalizeForSearch } from './searchText';
import { useHistoryList } from './useHistoryList';

const ORIGIN_LABELS = { image: 'foto', text: 'texto colado', slides: 'PowerPoint' } as const;

/** CA-007-02: type of material, where it came from and the date. */
function describe(entry: HistoryEntry): string {
  const type = MATERIAL_TYPES.find((option) => option.value === entry.adaptation.materialType);
  const date = new Date(entry.updatedAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const typeName = type ? type.label.split(' (')[0] : '';
  return `${typeName} (${ORIGIN_LABELS[entry.original.kind]}) · ${date}`;
}

/** Spec 007: search, reopen and delete the adaptations saved in this browser. */
export default function HistoryList() {
  const { entries, error, remove } = useHistoryList();
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  if (entries === null) return <p>Carregando o histórico...</p>;

  const wanted = normalizeForSearch(query);
  const shown = entries.filter((entry) => normalizeForSearch(entry.name).includes(wanted));

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar pelo nome"
        aria-label="Buscar pelo nome"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
      />
      {entries.length === 0 && !error && (
        <p className="text-slate-700">
          Nenhuma adaptação salva ainda.{' '}
          <Link to="/adaptar" className="text-teal-700 underline">
            Adaptar um material
          </Link>
        </p>
      )}
      {entries.length > 0 && shown.length === 0 && (
        <p className="text-slate-700">Nenhuma adaptação com esse nome.</p>
      )}
      <ul className="space-y-3">
        {shown.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <Link
                to={`/historico/${entry.id}`}
                className="font-semibold text-teal-800 hover:underline"
              >
                {entry.name.trim() || 'Sem nome'}
              </Link>
              <p className="text-sm text-slate-600">{describe(entry)}</p>
            </div>
            {/* CA-007-06: delete only after confirming. */}
            {confirming === entry.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Apagar de vez?</span>
                <button
                  type="button"
                  onClick={() => void remove(entry.id)}
                  className="rounded-lg bg-red-700 px-3 py-1 text-white"
                >
                  Sim, apagar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="rounded-lg bg-slate-200 px-3 py-1"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(entry.id)}
                className="rounded-lg bg-red-50 px-3 py-1 text-red-800"
              >
                Apagar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
