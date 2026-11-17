import { type ReactNode, useState } from 'react';

import Icon from '@/shared/ui/Icon';
import { buttonClass } from '@/shared/ui/styles';

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
        className="group relative -m-1.5 block w-[calc(100%+0.75rem)] cursor-text rounded-lg p-1.5 pr-8 text-left transition-colors hover:bg-amber-50 hover:ring-1 hover:ring-amber-200 print:m-0 print:w-full print:p-0"
      >
        {children}
        <Icon
          name="pencil"
          className="absolute top-2 right-2 size-4 text-amber-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 print:hidden"
        />
      </button>
    );
  }

  const trimmed = draft.trim();
  const confirm = () => {
    if (trimmed) onSave(trimmed);
    setDraft(null);
  };

  return (
    <div className="animate-fade-in w-full space-y-2 print:hidden">
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
        className="block w-full rounded-xl border-2 border-brand-600 p-3 text-lg focus:ring-4 focus:ring-brand-100 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={!trimmed}
          className={buttonClass('primary', 'sm')}
        >
          <Icon name="check" className="size-4" />
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setDraft(null)}
          className={buttonClass('secondary', 'sm')}
        >
          Cancelar
        </button>
        <span className="text-sm text-slate-500">
          {multiline ? 'Esc para cancelar' : 'Enter confirma · Esc cancela'}
        </span>
      </div>
    </div>
  );
}
