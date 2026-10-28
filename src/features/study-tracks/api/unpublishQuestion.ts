/**
 * POST /questions/{id}/unpublish (contrato C6).
 * Volta a pergunta para rascunho (remove a versao publicada do ar).
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { unpublishQuestionMock } from './questionsMock';

export async function unpublishQuestion(questionId: string): Promise<QuestionDTO> {
  if (env.useMocks) {
    return unpublishQuestionMock(questionId);
  }

  const { data } = await httpClient.post<QuestionDTO>(questionRoutes.unpublish(questionId));
  return data;
}
