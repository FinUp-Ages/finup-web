/**
 * DELETE /api/v1/admin/study-tracks/categories/{id} (contrato C6).
 * Responde 409 quando a categoria ainda tem perguntas.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import { deleteCategoryMock } from './categoriesMock';

export async function deleteCategory(categoryId: string): Promise<void> {
  if (env.useMocks) {
    return deleteCategoryMock(categoryId);
  }

  await httpClient.delete(
    `/api/v1/admin/study-tracks/categories/${encodeURIComponent(categoryId)}`,
  );
}
