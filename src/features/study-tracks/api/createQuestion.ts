/**
 * POST de uma pergunta da trilha (contrato C6). A pergunta nasce como rascunho.
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { FillBlankQuestionPayload, QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { createQuestionMock } from './questionsMock';

export async function createQuestion(
  categoryId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  if (env.useMocks) {
    return createQuestionMock(categoryId, payload);
  }

  const { data } = await httpClient.post<QuestionDTO>(
    questionRoutes.categoryQuestions(categoryId),
    payload,
  );
  return data;
}
