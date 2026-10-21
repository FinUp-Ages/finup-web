/**
 * GET das perguntas de uma categoria da trilha (contrato C6), com o status derivado.
 * A edicao usa esta lista porque o contrato nao tem GET de uma pergunta so.
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { getCategoryQuestionsMock } from './questionsMock';

export async function getCategoryQuestions(categoryId: string): Promise<QuestionDTO[]> {
  if (env.useMocks) {
    return getCategoryQuestionsMock(categoryId);
  }

  const { data } = await httpClient.get<QuestionDTO[]>(
    questionRoutes.categoryQuestions(categoryId),
  );
  return data;
}
