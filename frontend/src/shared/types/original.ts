/** The material as the teacher sent it. Kept in the browser only (sheet, history). */
export type OriginalMaterial =
  { kind: 'image'; image: Blob; url: string } | { kind: 'text'; text: string };
