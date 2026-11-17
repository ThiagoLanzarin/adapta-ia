import Icon from '@/shared/ui/Icon';

/** What the teacher reads while waiting. Only an estimate: the server answers in one go. */
const STAGES = [
  { from: 0, text: 'Enviando o material' },
  { from: 4, text: 'Lendo a prova' },
  { from: 15, text: 'Simplificando a linguagem' },
  { from: 30, text: 'Separando em etapas' },
  { from: 42, text: 'Buscando os pictogramas' },
];
const EXPECTED_SECONDS = 60;

/** CA-001-25: the adaptation is in progress, with the time passed. */
export default function AdaptationProgress({ seconds }: { seconds: number }) {
  const current = STAGES.filter((stage) => seconds >= stage.from).length - 1;
  // Slows down near the end, so the bar never says "done" before the answer comes.
  const percent = Math.min(
    95,
    Math.round((1 - Math.exp(-seconds / (EXPECTED_SECONDS / 2.2))) * 100),
  );

  return (
    <div aria-live="polite" className="animate-fade-in space-y-3">
      <div
        role="progressbar"
        aria-label="Andamento da adaptação"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-1000"
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>
      <ol className="space-y-1.5 text-sm">
        {STAGES.map((stage, index) => (
          <li
            key={stage.text}
            className={`flex items-center gap-2 ${
              index < current
                ? 'text-brand-800'
                : index === current
                  ? 'font-semibold text-slate-900'
                  : 'text-slate-400'
            }`}
          >
            {index < current ? (
              <Icon name="check" className="size-4" />
            ) : (
              <span
                aria-hidden="true"
                className={`mx-1 size-2 rounded-full ${index === current ? 'animate-pulse bg-brand-600' : 'bg-slate-300'}`}
              />
            )}
            {stage.text}
          </li>
        ))}
      </ol>
      <p className="text-sm text-slate-600">
        A IA está lendo e adaptando a prova ({seconds} s). Pode levar até 1 minuto.
      </p>
    </div>
  );
}
