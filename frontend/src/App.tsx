import { Route, Routes } from 'react-router';

import AdaptationPage from '@/pages/AdaptationPage';
import HistoryPage from '@/pages/HistoryPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilesPage from '@/pages/ProfilesPage';
import SavedAdaptationPage from '@/pages/SavedAdaptationPage';
import Layout from '@/shared/ui/Layout';

/** Routes of the app. Each page only composes features (docs/arquitetura.md, section 4). */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="adaptar" element={<AdaptationPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="historico/:id" element={<SavedAdaptationPage />} />
        <Route path="perfis" element={<ProfilesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
