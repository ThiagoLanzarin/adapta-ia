import { useState } from 'react';

import Icon from '@/shared/ui/Icon';
import { buttonClass } from '@/shared/ui/styles';

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
    <>
      <button
        type="button"
        disabled={preparing}
        onClick={() => start(true)}
        className={buttonClass('outline', 'md')}
      >
        <Icon name="download" />
        Baixar PDF
      </button>
      <button
        type="button"
        disabled={preparing}
        onClick={() => start(false)}
        className={buttonClass('primary', 'md')}
      >
        <Icon
          name={preparing ? 'refresh' : 'printer'}
          className={preparing ? 'animate-spin' : ''}
        />
        Imprimir
      </button>
      <div role="status" className="basis-full space-y-1 text-sm text-slate-700 empty:hidden">
        {preparing && <p>Preparando a folha: esperando os pictogramas carregarem...</p>}
        {pdfHint && (
          <p className="flex items-center gap-1.5 font-semibold text-brand-900">
            <Icon name="info" className="size-4" />
            Escolha "Salvar como PDF" no campo Destino (ou Impressora) da janela de impressão.
          </p>
        )}
      </div>
    </>
  );
}
