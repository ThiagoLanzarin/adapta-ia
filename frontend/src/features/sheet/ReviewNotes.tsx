import type { Adaptation } from '@/shared/types/contract';
import Alert from '@/shared/ui/Alert';

interface ReviewNotesProps {
  adaptation: Adaptation;
}

/** Warnings and "O que mudou": for the teacher, never printed (spec 006). */
export default function ReviewNotes({ adaptation }: ReviewNotesProps) {
  const { warnings, teacherNotes } = adaptation;
  if (warnings.length === 0 && teacherNotes.length === 0) return null;
  return (
    <section className="space-y-3 print:hidden">
      {warnings.map((warning) => (
        <Alert key={warning.message} tone="warning">
          {warning.message}
        </Alert>
      ))}
      {teacherNotes.length > 0 && (
        <Alert tone="info" role="status" title="O que mudou">
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {teacherNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Alert>
      )}
    </section>
  );
}
