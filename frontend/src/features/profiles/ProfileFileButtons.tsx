import { useRef, useState } from 'react';

import { type SavedProfile, saveProfiles } from '@/shared/storage/profiles';

import { parseProfilesFile, profilesFileName, profilesToFile } from './profileFile';

interface ProfileFileButtonsProps {
  profiles: SavedProfile[];
  onImported: () => Promise<void>;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** CA-003-08: export the profiles to a file and import them back, here or on another
 * computer. A profile with the same id is replaced; the others are kept. */
export default function ProfileFileButtons({ profiles, onImported }: ProfileFileButtonsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function importFile(file: File) {
    try {
      const imported = parseProfilesFile(await file.text());
      await saveProfiles(imported);
      await onImported();
      const count =
        imported.length === 1 ? '1 perfil importado' : `${imported.length} perfis importados`;
      setMessage({ text: `${count}.`, error: false });
    } catch (caught) {
      setMessage({ text: (caught as Error).message, error: true });
    }
  }

  return (
    <section
      aria-labelledby="profile-file-title"
      className="space-y-2 rounded-xl bg-white p-4 shadow-sm"
    >
      <h2 id="profile-file-title" className="font-semibold">
        Cópia de segurança
      </h2>
      <p className="text-sm text-slate-700">
        Os perfis ficam só neste navegador. Exporte para guardar uma cópia ou levar para outro
        computador. O arquivo tem as observações dos alunos: guarde em lugar seguro.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={profiles.length === 0}
          onClick={() => {
            download(profilesToFile(profiles), profilesFileName());
            setMessage(null);
          }}
          className="rounded-lg border-2 border-teal-700 px-4 py-2 font-semibold text-teal-800 disabled:opacity-50"
        >
          Exportar perfis
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border-2 border-teal-700 px-4 py-2 font-semibold text-teal-800"
        >
          Importar perfis
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label="Arquivo de perfis"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void importFile(file);
          }}
        />
      </div>
      {message && (
        <p
          role={message.error ? 'alert' : 'status'}
          className={message.error ? 'text-red-800' : 'text-teal-900'}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
