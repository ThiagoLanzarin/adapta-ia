import { useEffect, useRef, useState } from 'react';

import { pictogramUrl } from '@/shared/pictograms';
import type { Keyword } from '@/shared/types/contract';

import { usePictogramSearch } from './usePictogramSearch';

interface PictogramPickerProps {
  keyword: Keyword;
  color: boolean;
  onChoose: (pictogramId: number) => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Spec 004: swap (CA-004-21), search another word (CA-004-22) or remove (CA-004-23). */
export default function PictogramPicker({
  keyword,
  color,
  onChoose,
  onRemove,
  onClose,
}: PictogramPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { query, results, status, error, search } = usePictogramSearch(keyword.word);
  const [draft, setDraft] = useState(keyword.word);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        // Esc: the screen state closes the window, not the browser, so both stay in step.
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="picker-title"
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-xl p-6 backdrop:bg-slate-900/50 print:hidden"
    >
      <h2 id="picker-title" className="mb-4 text-xl font-bold">
        Pictograma de “{keyword.word}”
      </h2>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          search(draft);
        }}
      >
        <label className="sr-only" htmlFor="picker-query">
          Buscar outra palavra
        </label>
        <input
          id="picker-query"
          value={draft}
          maxLength={50}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-400 px-3 py-2"
        />
        <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-white">
          Buscar
        </button>
      </form>
      <div className="min-h-32">
        {status === 'loading' && <p>Buscando “{query}”…</p>}
        {status === 'error' && (
          <p role="alert" className="text-red-800">
            {error}
          </p>
        )}
        {status === 'done' && results.length === 0 && (
          <p>Nenhum pictograma para “{query}”. Tente outra palavra.</p>
        )}
        {status === 'done' && results.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {results.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onChoose(id)}
                  aria-pressed={id === keyword.pictogramId}
                  className="w-full rounded-lg border-2 border-slate-200 p-1 hover:border-teal-600 aria-pressed:border-teal-700 aria-pressed:bg-teal-50"
                >
                  <img
                    src={pictogramUrl(id, color)}
                    alt={`Opção ${id} para ${query}`}
                    className="aspect-square w-full object-contain"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg bg-red-50 px-4 py-2 text-red-800"
        >
          Remover pictograma
        </button>
        <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2">
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
