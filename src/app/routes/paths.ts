/**
 * Constantes com os caminhos das rotas.
 * Evita string solta espalhada em navegacoes e links.
 */
import type { QuestionType } from '@/features/study-tracks';

export const paths = {
  home: '/',
  login: '/login',
  admin: '/app',
  team: '/app/team',
  analytics: '/app/analytics',
  costs: '/app/costs',
  studies: '/app/studies',
  studiesCategoryQuestions: '/app/studies/categories/:categoryId/questions',
  studiesNewFillBlankQuestion: '/app/studies/categories/:categoryId/questions/new/fill-blank',
  studiesNewMultipleChoiceQuestion:
    '/app/studies/categories/:categoryId/questions/new/multiple-choice',
  studiesNewLearningQuestion: '/app/studies/categories/:categoryId/questions/new/learning',
  studiesEditQuestion: '/app/studies/categories/:categoryId/questions/:questionId/edit',
} as const;

export function studiesCategoryQuestionsPath(categoryId: string): string {
  return paths.studiesCategoryQuestions.replace(':categoryId', encodeURIComponent(categoryId));
}

const createQuestionPaths: Record<QuestionType, string> = {
  FILL_BLANK: paths.studiesNewFillBlankQuestion,
  MULTIPLE_CHOICE: paths.studiesNewMultipleChoiceQuestion,
  LEARNING: paths.studiesNewLearningQuestion,
};

export function studiesNewQuestionPath(categoryId: string, type: QuestionType): string {
  return createQuestionPaths[type].replace(':categoryId', encodeURIComponent(categoryId));
}

/** Caminho de edicao de uma pergunta da Trilha de estudos. */
export function studiesEditQuestionPath(categoryId: string, questionId: string): string {
  return paths.studiesEditQuestion
    .replace(':categoryId', encodeURIComponent(categoryId))
    .replace(':questionId', encodeURIComponent(questionId));
}
