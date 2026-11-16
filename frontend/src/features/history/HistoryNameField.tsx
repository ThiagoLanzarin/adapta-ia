interface HistoryNameFieldProps {
  name: string;
  onChange: (name: string) => void;
  error: string | null;
}

/** CA-007-01: the suggested name is the sheet title; the teacher can change it. */
export default function HistoryNameField({ name, onChange, error }: HistoryNameFieldProps) {
  return (
    <div className="space-y-2 print:hidden">
      <label className="block space-y-1">
        <span className="block font-semibold">Nome no histórico</span>
        <input
          value={name}
          maxLength={120}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        {!error && (
          <span className="block text-sm text-slate-600">
            Salvo sozinho neste navegador. Encontre depois em Histórico.
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
