/**
 * Arvore de rotas da aplicacao.
 * Mapeia cada caminho para a page de uma feature e para o layout administrativo.
 * Importa features somente pela API publica (@/features/<nome>).
 */
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { navigation, previewUser } from '@/app/routes/navigation';
import { paths } from '@/app/routes/paths';
import { AdminSectionPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { UsersPage } from '@/features/users';
import { WelcomePage } from '@/features/welcome';
import { AdminLayout } from '@/shared/layouts/AdminLayout';

const router = createBrowserRouter([
  { path: paths.home, element: <WelcomePage /> },
  { path: paths.login, element: <LoginPage /> },
  {
    // TODO: implementar em tarefa futura — proteger /app/* com ProtectedRoute quando a autenticacao for integrada.
    path: paths.admin,
    element: <AdminLayout navigation={navigation} user={previewUser} />,
    children: [
      { index: true, element: <Navigate to={paths.costs} replace /> },
      { path: paths.dashboard, element: <DashboardPage /> },
      { path: paths.team, element: <AdminSectionPage title="Seu time" /> },
      { path: paths.analytics, element: <AdminSectionPage title="Analytics" /> },
      { path: paths.costs, element: <AdminSectionPage title="Custos" /> },
      { path: paths.studies, element: <AdminSectionPage title="Trilha de estudos" /> },
    ],
  },
  { path: paths.users, element: <UsersPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
