/** Chaves do TanStack Query das perguntas da trilha. */
export const questionQueryKeys = {
  categoryQuestions: (categoryId: string) =>
    ['study-tracks', 'categories', categoryId, 'questions'] as const,
};
