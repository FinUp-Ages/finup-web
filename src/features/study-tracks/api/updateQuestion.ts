/**
 * PUT do rascunho de uma pergunta da trilha (contrato C6).
 * Altera so o `draft`, em qualquer status; numa pergunta publicada o status vira
 * PUBLISHED_WITH_CHANGES.
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { FillBlankQuestionPayload, QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { updateQuestionMock } from './questionsMock';

export async function updateQuestion(
  questionId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  if (env.useMocks) {
    return updateQuestionMock(questionId, payload);
  }

  const { data } = await httpClient.put<QuestionDTO>(questionRoutes.question(questionId), payload);
  return data;
}
