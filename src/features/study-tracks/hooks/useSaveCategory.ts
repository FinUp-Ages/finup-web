/**
 * Salva uma categoria: POST na criacao e PUT na edicao.
 * Depois de salvar, a lista e recarregada para trazer as contagens do backend.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/createCategory';
import { updateCategory } from '../api/updateCategory';
import { toSaveCategoryErrorMessage } from '../model/categoryErrorMessages';
import { toCategoryPayload } from '../model/categoryValidation';
import type { CategoryDTO, CategoryPayload } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';

/** Sem `categoryId`, cria; com `categoryId`, edita. */
interface SaveCategoryVariables {
  categoryId?: string;
  values: CategoryPayload;
}

export function useSaveCategory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ categoryId, values }: SaveCategoryVariables) => {
      const payload = toCategoryPayload(values);
      return categoryId ? updateCategory(categoryId, payload) : createCategory(payload);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryQueryKeys.list() }),
  });

  return {
    save: (variables: SaveCategoryVariables, onSaved: (category: CategoryDTO) => void) => {
      mutation.mutate(variables, { onSuccess: onSaved });
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? toSaveCategoryErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
