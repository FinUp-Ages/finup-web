import { useQuery } from '@tanstack/react-query';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { toLoadCategoryQuestionsErrorMessage } from '../model/questionErrorMessages';
import { questionQueryKeys } from './questionQueryKeys';

/** A lista e a edicao observam o mesmo cache, atualizado pelas mutations existentes. */
export function useCategoryQuestions(categoryId: string) {
  const query = useQuery({
    queryKey: questionQueryKeys.categoryQuestions(categoryId),
    queryFn: () => getCategoryQuestions(categoryId),
    enabled: Boolean(categoryId),
  });

  return {
    questions: query.data ?? [],
    hasData: query.data !== undefined,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    errorMessage: query.isError ? toLoadCategoryQuestionsErrorMessage(query.error) : null,
    reload: () => {
      void query.refetch();
    },
  };
}
