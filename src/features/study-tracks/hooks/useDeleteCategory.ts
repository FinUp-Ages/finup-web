/** Remove uma categoria (DELETE do C6). O 409 de categoria com perguntas vira mensagem na tela. */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../api/deleteCategory';
import { toDeleteCategoryErrorMessage } from '../model/categoryErrorMessages';
import { categoryQueryKeys } from './categoryQueryKeys';

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCategory,
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryQueryKeys.list() }),
  });

  return {
    remove: (categoryId: string, onRemoved: () => void) => {
      mutation.mutate(categoryId, { onSuccess: onRemoved });
    },
    isRemoving: mutation.isPending,
    errorMessage: mutation.isError ? toDeleteCategoryErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
