import { useState } from 'react';

import { reviseAdaptation } from '@/shared/api/adaptations';
import { ApiError } from '@/shared/api/client';
import type { Adaptation, StudentProfile } from '@/shared/types/contract';

/** Same limit as the server (spec 005, CA-005-04). */
const MAX_LENGTH = 300;

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
    <section
      aria-labelledby="revise-title"
      className="space-y-3 rounded-lg border border-slate-300 bg-white p-4 print:hidden"
    >
      <h2 id="revise-title" className="font-semibold">
        Pedir uma nova versão
      </h2>
      <label className="block space-y-1">
        <span className="text-slate-700">
          Escreva o que mudar na folha toda, por exemplo "deixe as frases mais curtas".
        </span>
        <textarea
          value={instruction}
          maxLength={MAX_LENGTH}
          rows={2}
          disabled={status !== 'writing'}
          onChange={(event) => setInstruction(event.target.value)}
          className="w-full rounded-lg border border-slate-400 p-2 disabled:bg-slate-100"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-600">
          {instruction.length} de {MAX_LENGTH} caracteres
        </span>
        {status === 'writing' && (
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => setStatus('confirming')}
            className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            Pedir nova versão
          </button>
        )}
      </div>
      {status === 'confirming' && (
        <div
          role="alertdialog"
          aria-labelledby="revise-warning"
          className="space-y-3 rounded-lg bg-amber-50 p-3"
        >
          <p id="revise-warning">
            <strong>A folha atual será substituída.</strong> Suas correções de texto vão junto no
            pedido, mas os pictogramas são buscados de novo: trocas feitas à mão podem se perder.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={revise}
              className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white"
            >
              Substituir a folha
            </button>
            <button
              type="button"
              onClick={() => setStatus('writing')}
              className="rounded-lg bg-slate-200 px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div role="status" className="empty:hidden">
        {status === 'waiting' && <p>Fazendo a nova versão. Isso pode levar até um minuto...</p>}
        {error && <p className="text-red-800">{error} A folha atual continua como estava.</p>}
      </div>
    </section>
  );
}
