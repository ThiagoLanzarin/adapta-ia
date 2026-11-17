import { Link } from 'react-router';

import Icon from '@/shared/ui/Icon';
import { buttonClass } from '@/shared/ui/styles';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O endereço pode ter mudado ou estar escrito errado.</p>
      <Link to="/" className={buttonClass('primary', 'md', 'mt-6')}>
        <Icon name="arrowLeft" />
        Voltar ao início
      </Link>
    </section>
  );
}
