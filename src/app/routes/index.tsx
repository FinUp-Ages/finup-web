/**
 * Arvore de rotas da aplicacao.
 * Mapeia cada caminho para a page de uma feature e para o layout administrativo.
 * Tudo sob /app exige sessao de administrador (ProtectedRoute).
 * Importa features somente pela API publica (@/features/<nome>).
 */
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthenticatedAdminLayout } from '@/app/routes/AuthenticatedAdminLayout';
import { navigation } from '@/app/routes/navigation';
import {
  paths,
  studiesCategoryQuestionsPath,
  studiesEditQuestionPath,
  studiesNewQuestionPath,
} from '@/app/routes/paths';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { AdminSectionPage } from '@/features/admin';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import {
  CategoryQuestionsPage,
  FillBlankQuestionPage,
  QuestionFormPendingPage,
  StudyCategoriesPage,
} from '@/features/study-tracks';
import { UsersPage } from '@/features/users';
import { WelcomePage } from '@/features/welcome';

const router = createBrowserRouter([
  { path: paths.home, element: <WelcomePage /> },
  { path: paths.login, element: <LoginPage redirectTo={paths.admin} /> },
  {
    path: paths.admin,
    element: (
      <ProtectedRoute>
        <AuthenticatedAdminLayout navigation={navigation} />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={paths.costs} replace /> },
      { path: paths.team, element: <UsersPage /> },
      { path: paths.analytics, element: <AdminSectionPage title="Analytics" /> },
      { path: paths.costs, element: <DashboardPage /> },
      {
        path: paths.studies,
        element: <StudyCategoriesPage questionsPathFor={studiesCategoryQuestionsPath} />,
      },
      {
        path: paths.studiesCategoryQuestions,
        element: (
          <CategoryQuestionsPage
            backTo={paths.studies}
            createPathFor={studiesNewQuestionPath}
            editPathFor={studiesEditQuestionPath}
          />
        ),
      },
      {
        path: paths.studiesNewFillBlankQuestion,
        element: (
          <FillBlankQuestionPage
            backTo={studiesCategoryQuestionsPath}
            backLabel="Perguntas da categoria"
            editPathFor={studiesEditQuestionPath}
          />
        ),
      },
      {
        path: paths.studiesNewMultipleChoiceQuestion,
        element: (
          <QuestionFormPendingPage
            type="MULTIPLE_CHOICE"
            backPathFor={studiesCategoryQuestionsPath}
          />
        ),
      },
      {
        path: paths.studiesNewLearningQuestion,
        element: (
          <QuestionFormPendingPage type="LEARNING" backPathFor={studiesCategoryQuestionsPath} />
        ),
      },
      {
        path: paths.studiesEditQuestion,
        element: (
          <FillBlankQuestionPage
            backTo={studiesCategoryQuestionsPath}
            backLabel="Perguntas da categoria"
            editPathFor={studiesEditQuestionPath}
          />
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
