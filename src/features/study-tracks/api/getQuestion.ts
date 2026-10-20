/**
 * GET de uma pergunta da trilha para edicao do rascunho.
 * PREMISSA: rota ainda nao definida no C6 (ver fillBlankContract.ts).
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { getQuestionMock } from './questionsMock';

export async function getQuestion(questionId: string): Promise<QuestionDTO> {
  if (env.useMocks) {
    return getQuestionMock(questionId);
  }

  const { data } = await httpClient.get<QuestionDTO>(questionRoutes.question(questionId));
  return data;
}
