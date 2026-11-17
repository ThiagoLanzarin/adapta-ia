import type { AiProviderName } from '@/shared/api/health';
import { useServerStatus } from '@/shared/api/useServerStatus';

const LABELS = {
  checking: { text: 'Conectando ao servidor...', color: 'bg-amber-100 text-amber-800' },
  online: { text: 'Servidor conectado', color: 'bg-teal-100 text-teal-800' },
  offline: { text: 'Servidor indisponível', color: 'bg-red-100 text-red-800' },
};

/** Says where the answers come from when it is not the real AI: the fake AI gives always the
 * same sheet; the replay gives the answers recorded in the rehearsal (T22, CA-001-27). */
const AI_NOTES: Partial<Record<AiProviderName, string>> = {
  fake: 'IA simulada: a folha não vem do seu material',
  replay: 'Modo demonstração: respostas gravadas no ensaio',
  custom: 'IA simulada: a folha não vem do seu material',
};

export default function ServerStatusBadge() {
  const { status, aiProvider } = useServerStatus();
  const label = LABELS[status];
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-sm ${label.color}`}>{label.text}</span>
      {status === 'online' && aiProvider && AI_NOTES[aiProvider] && (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
          {AI_NOTES[aiProvider]}
        </span>
      )}
    </span>
  );
}
