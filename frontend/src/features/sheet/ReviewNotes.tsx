import type { Adaptation } from '@/shared/types/contract';

interface ReviewNotesProps {
  adaptation: Adaptation;
}

/** Warnings and "O que mudou": for the teacher, never printed (spec 006). */
export default function ReviewNotes({ adaptation }: ReviewNotesProps) {
  const { warnings, teacherNotes } = adaptation;
  return (
    <section className="space-y-3 print:hidden">
      {warnings.map((warning) => (
        <p key={warning.message} role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">
          {warning.message}
        </p>
      ))}
      {teacherNotes.length > 0 && (
        <div className="rounded-lg bg-sky-50 p-4 text-sky-900">
          <h2 className="mb-2 font-bold">O que mudou</h2>
          <ul className="list-disc space-y-1 pl-5">
            {teacherNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
