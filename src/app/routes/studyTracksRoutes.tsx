import type { RouteObject } from 'react-router-dom';
import {
  CategoryQuestionsPage,
  EditQuestionPage,
  FillBlankQuestionPage,
  MultipleChoiceQuestionPage,
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
 * Os formularios das outras tasks sao conectados aqui, preservando paths e cache da feature.
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
      <MultipleChoiceQuestionPage
        backTo={studiesCategoryQuestionsPath}
        backLabel="Perguntas da categoria"
        editPathFor={studiesEditQuestionPath}
      />
    ),
  },
  {
    path: paths.studiesNewLearningQuestion,
    element: <QuestionFormPendingPage type="LEARNING" backPathFor={studiesCategoryQuestionsPath} />,
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
