import { type ReactNode, useState } from 'react';

interface EditableTextProps {
  value: string;
  label: string;
  onSave: (text: string) => void;
  children: ReactNode;
  multiline?: boolean;
}

/** CA-004-20: click the text, rewrite it and confirm. Empty text is not accepted. */
export default function EditableText({
  value,
  label,
  onSave,
  children,
  multiline = false,
}: EditableTextProps) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft === null) {
    return (
      <button
        type="button"
        title="Clique para editar"
        aria-label={`Editar ${label}`}
        onClick={() => setDraft(value)}
        className="block w-full cursor-text rounded text-left hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-teal-700"
      >
        {children}
      </button>
    );
  }

  const trimmed = draft.trim();
  const confirm = () => {
    if (trimmed) onSave(trimmed);
    setDraft(null);
  };

  return (
    <div className="w-full space-y-2 print:hidden">
      <textarea
        autoFocus
        aria-label={label}
        value={draft}
        rows={multiline ? 10 : 3}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDraft(null);
          if (event.key === 'Enter' && !multiline && !event.shiftKey) {
            event.preventDefault();
            confirm();
          }
        }}
        className="block w-full rounded-lg border-2 border-teal-700 p-2 text-lg"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={!trimmed}
          className="rounded-lg bg-teal-700 px-4 py-1 text-white disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setDraft(null)}
          className="rounded-lg bg-slate-200 px-4 py-1"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
