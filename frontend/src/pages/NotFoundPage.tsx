import { Link } from 'react-router';

import PageTitle from '@/shared/ui/PageTitle';

export default function NotFoundPage() {
  return (
    <section>
      <PageTitle title="Página não encontrada" />
      <Link to="/" className="text-teal-700 underline">
        Voltar ao início
      </Link>
    </section>
  );
}
