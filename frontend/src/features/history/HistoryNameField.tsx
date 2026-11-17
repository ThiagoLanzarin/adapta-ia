import Alert from '@/shared/ui/Alert';
import Icon from '@/shared/ui/Icon';

interface HistoryNameFieldProps {
  name: string;
  onChange: (name: string) => void;
  error: string | null;
}

/** CA-007-01: the suggested name is the sheet title; the teacher can change it. */
export default function HistoryNameField({ name, onChange, error }: HistoryNameFieldProps) {
  return (
    <div className="space-y-2 print:hidden">
      <label className="group block">
        <span className="sr-only">Nome no histórico</span>
        <span className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors focus-within:bg-slate-50 hover:bg-slate-50">
          <input
            value={name}
            maxLength={120}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Nome da adaptação"
            className="min-w-0 flex-1 bg-transparent text-xl font-bold tracking-tight outline-none"
          />
          <Icon
            name="pencil"
            className="size-4 text-slate-400 transition-colors group-hover:text-brand-700"
          />
        </span>
        {!error && (
          <span className="flex items-center gap-1.5 px-2 text-sm text-slate-500">
            <Icon name="check" className="size-3.5 text-brand-600" />
            Salvo sozinho neste navegador. Encontre depois em Histórico.
          </span>
        )}
      </label>
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
