// ARASAAC image address (docs/arquitetura.md, section 6). Licence CC BY-NC-SA: every sheet
// shows ARASAAC_CREDIT (RF-16).

export function pictogramUrl(id: number, color = true): string {
  return `https://api.arasaac.org/v1/pictograms/${id}${color ? '' : '?color=false'}`;
}

export const ARASAAC_CREDIT =
  'Pictogramas: Sergio Palao. Origem: ARASAAC (https://arasaac.org). Licença: CC BY-NC-SA. ' +
  'Propriedade: Governo de Aragão (Espanha).';
