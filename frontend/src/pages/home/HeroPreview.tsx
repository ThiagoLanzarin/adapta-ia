import { pictogramUrl } from '@/shared/pictograms';
import Icon from '@/shared/ui/Icon';

/** Drawing of what the tool does: a dense question becomes a short one with pictograms. */
export default function HeroPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-100 via-amber-50 to-sky-100 blur-2xl" />
      <div className="rotate-[-2deg] rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-snug text-slate-500 shadow-card">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Original</p>
        <p>
          3) Considerando o texto acima, explique o processo pelo qual a água presente nos rios e
          oceanos, ao ser aquecida pela radiação solar, transforma-se em vapor.
        </p>
      </div>
      <div className="relative z-10 -mt-3 ml-6 flex justify-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg ring-4 ring-white">
          <Icon name="sparkles" className="size-5" />
        </span>
      </div>
      <div className="-mt-3 rotate-[1.5deg] rounded-2xl border border-slate-200 bg-white p-5 shadow-paper">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">
          Questão 3 de 5
        </p>
        <div className="flex items-start gap-4">
          <div className="flex shrink-0 gap-2">
            {[
              { id: 7252, word: 'sol' },
              { id: 2248, word: 'água' },
            ].map((item) => (
              <figure key={item.id} className="w-16 text-center">
                <img
                  src={pictogramUrl(item.id)}
                  alt=""
                  className="mx-auto size-16 object-contain"
                />
                <figcaption className="text-xs text-slate-600">{item.word}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-lg leading-snug text-slate-900">
            O sol esquenta a água. O que acontece com a água?
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="border-b-2 border-slate-300" />
          <div className="border-b-2 border-slate-300" />
        </div>
      </div>
    </div>
  );
}
