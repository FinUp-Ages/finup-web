/**
 * Mensagens de erro das perguntas da trilha, a partir do ApiError normalizado pelo httpClient.
 *
 * O `detail` do problem+json e uma frase em portugues para o usuario e so e exibido nos erros de
 * regra (400, 404, 422). Os demais viram mensagens fixas, sem detalhe tecnico.
 */
import { ApiError } from '@/shared/config/apiError';

const OFFLINE_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

/** A categoria existe, mas a pergunta nao esta na lista dela. */
export const questionNotFoundMessage = 'Pergunta não encontrada nesta categoria.';

function ruleDetail(error: ApiError): string | null {
  if (error.status && [400, 404, 422].includes(error.status)) {
    return error.problem?.detail ?? null;
  }
  return null;
}

export function toLoadQuestionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 404) {
      return 'Categoria não encontrada.';
    }
    if (error.status === 403) {
      return 'Você não tem permissão para acessar esta pergunta.';
    }
  }
  return 'Não foi possível carregar a pergunta.';
}

export function toSaveQuestionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 403) {
      return 'Você não tem permissão para salvar esta pergunta.';
    }
    if (error.status === 404) {
      return ruleDetail(error) ?? 'Pergunta ou categoria não encontrada.';
    }
    return ruleDetail(error) ?? 'Não foi possível salvar a pergunta. Tente novamente.';
  }
  return 'Não foi possível salvar a pergunta. Tente novamente.';
}
