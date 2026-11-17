// ARASAAC image address (docs/arquitetura.md, section 6). Licence CC BY-NC-SA: every sheet
// shows ARASAAC_CREDIT (RF-16).

export function pictogramUrl(id: number, color = true): string {
  return `https://api.arasaac.org/v1/pictograms/${id}${color ? '' : '?color=false'}`;
}

export const ARASAAC_CREDIT =
  'Autor dos pictogramas: Sergio Palao. Origem: ARASAAC (http://www.arasaac.org). ' +
  'Licença: CC (BY-NC-SA). Proprietário: Governo de Aragão (Espanha).';
