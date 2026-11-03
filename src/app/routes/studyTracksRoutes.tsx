import type { RouteObject } from 'react-router-dom';
import {
  CategoryQuestionsPage,
  EditQuestionPage,
  FillBlankQuestionPage,
  LearningQuestionPage,
  QuestionFormPendingPage,
  StudyCategoriesPage,
} from '@/features/study-tracks';
import {
  paths,
  studiesCategoryQuestionsPath,
  studiesEditQuestionPath,
  studiesNewQuestionPath,
} from './paths';

/**
 * Rotas da Trilha, montadas sob ProtectedRoute no router principal.
 * Os formulários das outras tasks são conectados aqui, preservando paths e cache da feature.
 */
export const studyTracksRoutes: RouteObject[] = [
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
      <QuestionFormPendingPage type="MULTIPLE_CHOICE" backPathFor={studiesCategoryQuestionsPath} />
    ),
  },
  {
    path: paths.studiesNewLearningQuestion,
    element: (
      <LearningQuestionPage
        backTo={studiesCategoryQuestionsPath}
        backLabel="Perguntas da categoria"
        editPathFor={studiesEditQuestionPath}
      />
    ),
  },
  {
    path: paths.studiesEditQuestion,
    element: (
      <EditQuestionPage
        backTo={studiesCategoryQuestionsPath}
        backLabel="Perguntas da categoria"
        editPathFor={studiesEditQuestionPath}
      />
    ),
  },
];
