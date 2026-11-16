import { useState } from 'react';

import { printSheet } from './printSheet';

/** CA-006-01/02: "Imprimir" and "Baixar PDF" open the same browser print; the PDF button
 * adds a hint, because the PDF is saved from the print dialog. */
export default function PrintButtons() {
  const [preparing, setPreparing] = useState(false);
  const [pdfHint, setPdfHint] = useState(false);

  async function start(pdf: boolean) {
    setPdfHint(pdf);
    setPreparing(true);
    await printSheet();
    setPreparing(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={preparing}
        onClick={() => start(false)}
        className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        Imprimir
      </button>
      <button
        type="button"
        disabled={preparing}
        onClick={() => start(true)}
        className="rounded-lg border-2 border-teal-700 px-4 py-2 font-semibold text-teal-800 disabled:opacity-50"
      >
        Baixar PDF
      </button>
      <div role="status" className="basis-full space-y-1 text-sm text-slate-700 empty:hidden">
        {preparing && <p>Preparando a folha: esperando os pictogramas carregarem...</p>}
        {pdfHint && (
          <p className="font-semibold text-teal-900">
            Escolha "Salvar como PDF" no campo Destino (ou Impressora) da janela de impressão.
          </p>
        )}
      </div>
    </div>
  );
}
