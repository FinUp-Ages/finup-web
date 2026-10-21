/** PUT /api/v1/admin/study-tracks/categories/{id} (contrato C6): edita nome e descricao. */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { CategoryDTO, CategoryPayload } from '../types';
import { updateCategoryMock } from './categoriesMock';

export async function updateCategory(
  categoryId: string,
  payload: CategoryPayload,
): Promise<CategoryDTO> {
  if (env.useMocks) {
    return updateCategoryMock(categoryId, payload);
  }

  const { data } = await httpClient.put<CategoryDTO>(
    `/api/v1/admin/study-tracks/categories/${encodeURIComponent(categoryId)}`,
    payload,
  );
  return data;
}
