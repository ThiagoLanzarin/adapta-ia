import { useState } from 'react';

import { reviseAdaptation } from '@/shared/api/adaptations';
import { ApiError } from '@/shared/api/client';
import type { Adaptation, StudentProfile } from '@/shared/types/contract';
import Alert from '@/shared/ui/Alert';
import Icon from '@/shared/ui/Icon';
import { buttonClass, CARD_CLASS, INPUT_CLASS } from '@/shared/ui/styles';

/** Same limit as the server (spec 005, CA-005-04). */
const MAX_LENGTH = 300;

/** Common requests, one click to fill the field. The teacher can still change the text. */
const SUGGESTIONS = [
  'Deixe as frases mais curtas',
  'Use palavras mais simples',
  'Coloque mais pictogramas',
];

type Status = 'writing' | 'confirming' | 'waiting';

interface RevisePanelProps {
  adaptation: Adaptation;
  profile: StudentProfile;
  onRevised: (adaptation: Adaptation) => void;
}

/** Spec 005, CA-005-20/21: the teacher writes a request, confirms the replacement and gets a
 * new version. On error the current sheet stays as it was. */
export default function RevisePanel({ adaptation, profile, onRevised }: RevisePanelProps) {
  const [instruction, setInstruction] = useState('');
  const [status, setStatus] = useState<Status>('writing');
  const [error, setError] = useState<string | null>(null);
  const trimmed = instruction.trim();

  async function revise() {
    setStatus('waiting');
    setError(null);
    try {
      // The current sheet goes with the teacher's edits (R-005-01).
      onRevised(await reviseAdaptation({ adaptation, profile, instruction: trimmed }));
      setInstruction('');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Algo deu errado. Tente de novo.');
    }
    setStatus('writing');
  }

  return (
    <section aria-labelledby="revise-title" className={`${CARD_CLASS} space-y-3 p-5 print:hidden`}>
      <h2 id="revise-title" className="flex items-center gap-2 text-lg font-bold">
        <Icon name="refresh" className="size-5 text-brand-700" />
        Pedir uma nova versão
      </h2>
      <label className="block space-y-1.5">
        <span className="text-slate-600">
          Escreva o que mudar na folha toda, por exemplo "deixe as frases mais curtas".
        </span>
        <textarea
          value={instruction}
          maxLength={MAX_LENGTH}
          rows={2}
          disabled={status !== 'writing'}
          onChange={(event) => setInstruction(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>
      {status === 'writing' && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => setInstruction(text)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm tabular-nums text-slate-500">
          {instruction.length} de {MAX_LENGTH} caracteres
        </span>
        {status === 'writing' && (
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => setStatus('confirming')}
            className={buttonClass('primary', 'md')}
          >
            Pedir nova versão
          </button>
        )}
      </div>
      {status === 'confirming' && (
        <div
          role="alertdialog"
          aria-labelledby="revise-warning"
          className="animate-fade-in space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
        >
          <p id="revise-warning">
            <strong>A folha atual será substituída.</strong> Suas correções de texto vão junto no
            pedido, mas os pictogramas são buscados de novo: trocas feitas à mão podem se perder.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={revise} className={buttonClass('primary', 'md')}>
              Substituir a folha
            </button>
            <button
              type="button"
              onClick={() => setStatus('writing')}
              className={buttonClass('secondary', 'md', 'bg-white')}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div role="status" className="empty:hidden">
        {status === 'waiting' && (
          <p className="flex items-center gap-2 text-slate-700">
            <Icon name="refresh" className="size-4 animate-spin text-brand-700" />
            Fazendo a nova versão. Isso pode levar até um minuto...
          </p>
        )}
        {error && (
          <Alert tone="error" role="status">
            {error} A folha atual continua como estava.
          </Alert>
        )}
      </div>
    </section>
  );
}
