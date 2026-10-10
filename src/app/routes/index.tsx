/**
 * Arvore de rotas da aplicacao.
 * Mapeia cada caminho para a page de uma feature e para o layout administrativo.
 * Importa features somente pela API publica (@/features/<nome>).
 */
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { paths } from '@/app/routes/paths';
import { AdminSectionPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { WelcomePage } from '@/features/welcome';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import avatar from '@/shared/assets/sidebar/avatar.png';
import teamIcon from '@/shared/assets/sidebar/team.png';
import analyticsIcon from '@/shared/assets/sidebar/analytics.png';
import costsIcon from '@/shared/assets/sidebar/costs.png';
import studiesIcon from '@/shared/assets/sidebar/studies.png';

const navigation = [
  { label: 'Pessoas', links: [{ label: 'Seu time', to: paths.team, icon: teamIcon }] },
  {
    label: 'Aplicativo',
    links: [
      { label: 'Analytics', to: paths.analytics, icon: analyticsIcon },
      { label: 'Custos', to: paths.costs, icon: costsIcon },
      { label: 'Trilha de estudos', to: paths.studies, icon: studiesIcon },
    ],
  },
];

// A autenticacao ainda nao fornece perfil ao frontend. Estes dados ilustram o layout do Figma.
const previewUser = {
  name: 'Carlos José',
  role: 'Head de tecnologia',
  avatar,
};

const router = createBrowserRouter([
  { path: paths.home, element: <WelcomePage /> },
  { path: paths.login, element: <LoginPage /> },
  {
    path: paths.admin,
    element: <AdminLayout navigation={navigation} user={previewUser} />,
    children: [
      { index: true, element: <Navigate to={paths.costs} replace /> },
      { path: 'team', element: <AdminSectionPage title="Seu time" /> },
      { path: 'analytics', element: <AdminSectionPage title="Analytics" /> },
      { path: 'costs', element: <AdminSectionPage title="Custos" /> },
      { path: 'studies', element: <AdminSectionPage title="Trilha de estudos" /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
