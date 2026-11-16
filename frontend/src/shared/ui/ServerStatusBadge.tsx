import { useServerStatus } from '@/shared/api/useServerStatus';

const LABELS = {
  checking: { text: 'Conectando ao servidor...', color: 'bg-amber-100 text-amber-800' },
  online: { text: 'Servidor conectado', color: 'bg-teal-100 text-teal-800' },
  offline: { text: 'Servidor indisponível', color: 'bg-red-100 text-red-800' },
};

export default function ServerStatusBadge() {
  const label = LABELS[useServerStatus()];
  return <span className={`rounded-full px-3 py-1 text-sm ${label.color}`}>{label.text}</span>;
}
