import { ProfilesManager } from '@/features/profiles';
import PageTitle from '@/shared/ui/PageTitle';

export default function ProfilesPage() {
  return (
    <section>
      <PageTitle
        title="Perfis de aluno"
        subtitle="As necessidades de apoio de cada aluno, sem o nome. Ficam só neste navegador."
      />
      <ProfilesManager />
    </section>
  );
}
