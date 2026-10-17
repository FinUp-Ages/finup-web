import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/getUsers';
import type { GetUsersParams } from '../types';

export function useUsers(params: GetUsersParams) {
  const query = useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    users: query.data?.content ?? [],
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    errorMessage: query.isError ? 'Não foi possível carregar os usuários.' : null,
    reload: () => {
      void query.refetch();
    },
  };
}
