// Reduces the photo in the browser before sending (docs/arquitetura.md, section 6):
// longest side up to 1600 px, JPEG quality 0.85. Re-encoding also drops the photo metadata
// (such as GPS). HEIC/HEIF cannot be decoded by Chrome, so it goes as it is.

export const MAX_SIDE_PX = 1600;
export const JPEG_QUALITY = 0.85;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export async function reduceImage(file: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  context.fillStyle = '#ffffff'; // transparent PNGs become white, not black
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const reduced = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );
  return reduced ?? file;
}
