import { useServerStatus } from '@/shared/api/useServerStatus';

const LABELS = {
  checking: { text: 'Conectando ao servidor...', color: 'bg-amber-100 text-amber-800' },
  online: { text: 'Servidor conectado', color: 'bg-teal-100 text-teal-800' },
  offline: { text: 'Servidor indisponível', color: 'bg-red-100 text-red-800' },
};

/** Warns when the answers come from the fake AI, so nobody takes them as a real adaptation. */
export default function ServerStatusBadge() {
  const { status, aiProvider } = useServerStatus();
  const label = LABELS[status];
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-sm ${label.color}`}>{label.text}</span>
      {status === 'online' && aiProvider !== 'gemini' && (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
          Modo demonstração: a IA não lê o seu material
        </span>
      )}
    </span>
  );
}
