/**
 * POST /questions/{id}/publish (contrato C6).
 * Publica a pergunta (copia o rascunho para a versao no ar).
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { publishQuestionMock } from './questionsMock';

export async function publishQuestion(questionId: string): Promise<QuestionDTO> {
  if (env.useMocks) {
    return publishQuestionMock(questionId);
  }

  const { data } = await httpClient.post<QuestionDTO>(questionRoutes.publish(questionId));
  return data;
}
