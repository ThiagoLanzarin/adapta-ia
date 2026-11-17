import { useState } from 'react';

import Icon, { type IconName } from '@/shared/ui/Icon';

interface DropzoneProps {
  icon: IconName;
  title: string;
  hint: string;
  accept: string;
  inputLabel: string;
  busy?: string | null;
  onFile: (file: File | undefined) => void;
}

/** Big area that opens the file window on click and also takes a dropped file. The native
 * input is hidden: after Tailwind's reset it looks like plain text. */
export default function Dropzone({
  icon,
  title,
  hint,
  accept,
  inputLabel,
  busy,
  onFile,
}: DropzoneProps) {
  const [over, setOver] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        onFile(event.dataTransfer.files[0]);
      }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-4 focus-within:ring-brand-100 ${
        over
          ? 'border-brand-600 bg-brand-100'
          : 'border-brand-300 bg-brand-50/60 hover:border-brand-500 hover:bg-brand-50'
      }`}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card">
        <Icon name={busy ? 'refresh' : icon} className={`size-7 ${busy ? 'animate-spin' : ''}`} />
      </span>
      <span className="text-lg font-semibold text-brand-900">{busy ?? title}</span>
      <span className="text-sm text-slate-600">
        {busy ? 'Só um instante.' : `Clique ou arraste o arquivo aqui. ${hint}`}
      </span>
      <input
        type="file"
        accept={accept}
        aria-label={inputLabel}
        className="sr-only"
        disabled={Boolean(busy)}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}
