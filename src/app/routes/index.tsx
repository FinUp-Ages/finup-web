/**
 * Arvore de rotas da aplicacao.
 * Mapeia cada caminho para a page de uma feature e define quais ficam sob layout autenticado.
 * Importa features somente pela API publica (@/features/<nome>).
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { paths } from '@/app/routes/paths';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { WelcomePage } from '@/features/welcome';

const router = createBrowserRouter([
  { path: paths.home, element: <WelcomePage /> },
  { path: paths.login, element: <LoginPage /> },
  { path: paths.dashboard, element: <DashboardPage /> },
  // TODO: implementar em tarefa futura — demais rotas e rotas protegidas (ProtectedRoute + shared/layouts/).
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
