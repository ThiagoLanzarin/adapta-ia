import { HistoryList } from '@/features/history';
import PageTitle from '@/shared/ui/PageTitle';

export default function HistoryPage() {
  return (
    <section>
      <PageTitle
        title="Histórico"
        subtitle="As adaptações salvas neste navegador. Elas não vão para outro aparelho."
      />
      <HistoryList />
    </section>
  );
}
