/** Lista das categorias da trilha (GET do C6). */
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/getCategories';
import { toLoadCategoriesErrorMessage } from '../model/categoryErrorMessages';
import { categoryQueryKeys } from './categoryQueryKeys';

export function useCategories() {
  const query = useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: getCategories,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    errorMessage: query.isError ? toLoadCategoriesErrorMessage(query.error) : null,
    reload: () => {
      void query.refetch();
    },
  };
}
