// Spec 006: the browser prints the page; CSS (`print:` classes and index.css) keeps only the
// student's sheet. The PDF is the same print, saved by the teacher as PDF (no server PDF).
import { ARASAAC_CREDIT } from '@/shared/pictograms';

// CA-006-03: read by `@page @bottom-center` in index.css (a CSS string). Set once, so Ctrl+P
// also prints the credit.
document.documentElement.style.setProperty('--sheet-credit', JSON.stringify(ARASAAC_CREDIT));

/** Marks the element that holds the student's sheet. */
export const SHEET_ATTRIBUTE = 'data-student-sheet';

/** Longest wait for images, so a slow ARASAAC never blocks printing for good. */
const IMAGE_TIMEOUT_MS = 15000;

function imageSettled(image: HTMLImageElement): Promise<void> {
  if (image.complete) return Promise.resolve();
  return new Promise((resolve) => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  });
}

/** CA-006-04: resolves when every image of the sheet has loaded (or failed), or on timeout. */
export function waitForSheetImages(): Promise<void> {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>(`[${SHEET_ATTRIBUTE}] img`),
  );
  const settled = Promise.all(images.map(imageSettled)).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, IMAGE_TIMEOUT_MS));
  return Promise.race([settled, timeout]);
}

/** Opens the browser print dialog once the pictograms are ready. */
export async function printSheet(): Promise<void> {
  await waitForSheetImages();
  window.print();
}
