/** GET /api/v1/admin/study-tracks/categories (contrato C6): lista as categorias da trilha. */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { CategoryDTO } from '../types';
import { getCategoriesMock } from './categoriesMock';

export async function getCategories(): Promise<CategoryDTO[]> {
  if (env.useMocks) {
    return getCategoriesMock();
  }

  const { data } = await httpClient.get<CategoryDTO[]>('/api/v1/admin/study-tracks/categories');
  return data;
}
