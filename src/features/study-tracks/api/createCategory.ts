/** POST /api/v1/admin/study-tracks/categories (contrato C6): cria a categoria e responde 201. */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { CategoryDTO, CategoryPayload } from '../types';
import { createCategoryMock } from './categoriesMock';

export async function createCategory(payload: CategoryPayload): Promise<CategoryDTO> {
  if (env.useMocks) {
    return createCategoryMock(payload);
  }

  const { data } = await httpClient.post<CategoryDTO>(
    '/api/v1/admin/study-tracks/categories',
    payload,
  );
  return data;
}
