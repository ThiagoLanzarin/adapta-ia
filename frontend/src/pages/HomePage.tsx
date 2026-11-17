import { Link } from 'react-router';

import PageTitle from '@/shared/ui/PageTitle';

export default function HomePage() {
  return (
    <section>
      <PageTitle
        title="Adapte a prova para o seu aluno"
        subtitle="Envie a foto da prova em branco e receba uma folha adaptada, com linguagem simples e pictogramas."
      />
      <div>
        <Link
          to="/adaptar"
          className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          Começar uma adaptação
        </Link>
      </div>
    </section>
  );
}
