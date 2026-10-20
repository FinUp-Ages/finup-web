/**
 * Mensagens de erro das perguntas da trilha, a partir do ApiError normalizado pelo httpClient.
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

export function toLoadQuestionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === null) {
      return OFFLINE_MESSAGE;
    }
    if (error.status === 404) {
      return 'Pergunta não encontrada.';
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
    if (error.status === 404) {
      return error.problem?.detail ?? 'Pergunta ou categoria não encontrada.';
    }
    if (error.status === 403) {
      return 'Você não tem permissão para salvar esta pergunta.';
    }
    if (error.status === 409) {
      return ruleDetail(error) ?? 'Somente perguntas em rascunho podem ser editadas.';
    }
    return ruleDetail(error) ?? 'Não foi possível salvar a pergunta. Tente novamente.';
  }
  return 'Não foi possível salvar a pergunta. Tente novamente.';
}
