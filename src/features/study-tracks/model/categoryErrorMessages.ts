/**
 * Mensagens de erro das categorias da trilha, a partir do ApiError normalizado pelo httpClient.
 *
 * O `detail` do problem+json e uma frase em portugues para o usuario e so e exibido nos erros de
 * regra (400, 409, 422). Os demais viram mensagens fixas, sem detalhe tecnico.
 */
import { ApiError } from '@/shared/config/apiError';

const OFFLINE_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

function ruleDetail(error: unknown): string | null {
  if (error instanceof ApiError && error.status && [400, 409, 422].includes(error.status)) {
    return error.problem?.detail ?? null;
  }
  return null;
}

export function toLoadCategoriesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 403) {
      return 'Você não tem permissão para ver as categorias.';
    }
  }
  return 'Não foi possível carregar as categorias.';
}

export function toSaveCategoryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 404) {
      return 'Categoria não encontrada. Ela pode ter sido removida.';
    }
    if (error.status === 403) {
      return 'Você não tem permissão para salvar categorias.';
    }
    return ruleDetail(error) ?? 'Não foi possível salvar a categoria. Tente novamente.';
  }
  return 'Não foi possível salvar a categoria. Tente novamente.';
}

export function toDeleteCategoryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 409) {
      return (
        ruleDetail(error) ??
        'A categoria possui perguntas e não pode ser removida. Remova as perguntas antes.'
      );
    }
    if (error.status === 404) {
      return 'Categoria não encontrada. Ela pode já ter sido removida.';
    }
    if (error.status === 403) {
      return 'Você não tem permissão para remover categorias.';
    }
  }
  return 'Não foi possível remover a categoria. Tente novamente.';
}
