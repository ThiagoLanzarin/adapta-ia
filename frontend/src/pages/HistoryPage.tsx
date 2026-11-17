import { Link } from 'react-router';

import { HistoryList } from '@/features/history';
import Icon from '@/shared/ui/Icon';
import PageTitle from '@/shared/ui/PageTitle';
import { buttonClass } from '@/shared/ui/styles';

export default function HistoryPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <PageTitle
        eyebrow="Suas folhas"
        title="Histórico"
        subtitle="As adaptações salvas neste navegador. Elas não vão para outro aparelho."
        actions={
          <Link to="/adaptar" className={buttonClass('primary', 'md')}>
            <Icon name="plus" />
            Nova adaptação
          </Link>
        }
      />
      <HistoryList />
    </section>
  );
}
