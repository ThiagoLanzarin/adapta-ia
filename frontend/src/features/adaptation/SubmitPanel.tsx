import { MATERIAL_TYPES, SUPPORT_OPTIONS } from '@/shared/profile/supportOptions';
import type { MaterialType, StudentProfile } from '@/shared/types/contract';
import type { OriginalMaterial } from '@/shared/types/original';
import Alert from '@/shared/ui/Alert';
import Icon from '@/shared/ui/Icon';
import { buttonClass, CARD_CLASS } from '@/shared/ui/styles';

import AdaptationProgress from './AdaptationProgress';

interface SubmitPanelProps {
  materialType: MaterialType;
  profile: StudentProfile;
  material: OriginalMaterial | null;
  loading: boolean;
  seconds: number;
  error: string | null;
}

function describeMaterial(material: OriginalMaterial | null): string {
  if (!material) return 'Falta enviar';
  if (material.kind === 'image') return 'Foto enviada';
  if (material.kind === 'text') return `Texto com ${material.text.length} caracteres`;
  const count = material.slides.length;
  return count === 1 ? '1 slide marcado' : `${count} slides marcados`;
}

/** Summary of the choices, the "Adaptar" button, the progress and the errors. Sticky on wide
 * screens, so the button is always in sight. */
export default function SubmitPanel(props: SubmitPanelProps) {
  const { materialType, profile, material, loading, seconds, error } = props;
  const type = MATERIAL_TYPES.find((option) => option.value === materialType);
  const marked = SUPPORT_OPTIONS.filter((option) => profile[option.key]).length;
  const rows = [
    { label: 'Tipo', value: type?.label.split(' (')[0] ?? '', done: true },
    {
      label: 'Apoios',
      value: marked === 0 ? 'Nenhum marcado' : `${marked} marcado${marked > 1 ? 's' : ''}`,
      done: marked > 0,
    },
    { label: 'Material', value: describeMaterial(material), done: material !== null },
  ];

  return (
    <aside className={`${CARD_CLASS} space-y-5 p-5 lg:sticky lg:top-24`}>
      <h2 className="text-lg font-bold">Resumo</h2>
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${row.done ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'}`}
            >
              <Icon name={row.done ? 'check' : 'plus'} className="size-3.5" />
            </span>
            <dt className="text-slate-600">{row.label}</dt>
            <dd className="ml-auto text-right font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
      {error && <Alert tone="error">{error}</Alert>}
      <button type="submit" disabled={loading} className={buttonClass('primary', 'lg', 'w-full')}>
        <Icon name={loading ? 'refresh' : 'sparkles'} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Adaptando...' : 'Adaptar'}
      </button>
      {loading && <AdaptationProgress seconds={seconds} />}
      {!loading && (
        <p className="text-center text-sm text-slate-500">Você revisa tudo antes de imprimir.</p>
      )}
    </aside>
  );
}
