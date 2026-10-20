/** Chaves do TanStack Query das perguntas da trilha. */
export const questionQueryKeys = {
  detail: (questionId: string) => ['study-tracks', 'questions', questionId] as const,
};
