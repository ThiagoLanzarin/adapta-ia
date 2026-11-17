import type { AiProviderName } from '@/shared/api/health';
import { useServerStatus } from '@/shared/api/useServerStatus';

const LABELS = {
  checking: {
    text: 'Conectando ao servidor...',
    box: 'bg-amber-50 text-amber-900 ring-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  online: {
    text: 'Servidor conectado',
    box: 'bg-brand-50 text-brand-900 ring-brand-200',
    dot: 'bg-brand-500',
  },
  offline: {
    text: 'Servidor indisponível',
    box: 'bg-red-50 text-red-900 ring-red-200',
    dot: 'bg-red-500',
  },
};

/** Says where the answers come from when it is not the real AI: the fake AI gives always the
 * same sheet; the replay gives the answers recorded in the rehearsal (T22, CA-001-27). */
const AI_NOTES: Partial<Record<AiProviderName, string>> = {
  fake: 'IA simulada: a folha não vem do seu material',
  replay: 'Modo demonstração: respostas gravadas no ensaio',
  custom: 'IA simulada: a folha não vem do seu material',
};

const PILL = 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1';

export default function ServerStatusBadge() {
  const { status, aiProvider } = useServerStatus();
  const label = LABELS[status];
  return (
    <span className="flex flex-wrap items-center justify-end gap-2">
      <span className={`${PILL} ${label.box}`}>
        <span aria-hidden="true" className={`size-2 rounded-full ${label.dot}`} />
        {label.text}
      </span>
      {status === 'online' && aiProvider && AI_NOTES[aiProvider] && (
        <span className={`${PILL} bg-amber-50 text-amber-900 ring-amber-200`}>
          {AI_NOTES[aiProvider]}
        </span>
      )}
    </span>
  );
}
