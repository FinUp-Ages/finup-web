/**
 * Constantes com os caminhos das rotas.
 * Evita string solta espalhada em navegacoes e links.
 */
export const paths = {
  home: '/',
  login: '/login',
  admin: '/app',
  dashboard: '/app/dashboard',
  team: '/app/team',
  analytics: '/app/analytics',
  costs: '/app/costs',
  studies: '/app/studies',
  studiesNewFillBlankQuestion: '/app/studies/categories/:categoryId/questions/new/fill-blank',
  studiesEditQuestion: '/app/studies/categories/:categoryId/questions/:questionId/edit',
} as const;

/** Caminho de edicao de uma pergunta da Trilha de estudos. */
export function studiesEditQuestionPath(categoryId: string, questionId: string): string {
  return paths.studiesEditQuestion
    .replace(':categoryId', encodeURIComponent(categoryId))
    .replace(':questionId', encodeURIComponent(questionId));
}
