/**
 * Arvore de rotas da aplicacao.
 * Mapeia cada caminho para a page de uma feature e define quais ficam sob layout autenticado.
 * Importa features somente pela API publica (@/features/<nome>).
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { paths } from '@/app/routes/paths';
import { WelcomePage } from '@/features/welcome';

const router = createBrowserRouter([
  { path: paths.home, element: <WelcomePage /> },
  // TODO: implementar em tarefa futura — demais rotas e rotas protegidas (ProtectedRoute + shared/layouts/).
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
