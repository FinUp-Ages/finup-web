/**
 * DELETE /questions/{id}/draft (contrato C6).
 * Descarta as alteracoes pendentes no rascunho, revertendo-o para a versao publicada.
 * Sem hooks do React, sem estado e sem JSX.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionDTO } from '../types';
import { questionRoutes } from './fillBlankContract';
import { discardDraftQuestionMock } from './questionsMock';

export async function discardDraftQuestion(questionId: string): Promise<QuestionDTO> {
  if (env.useMocks) {
    return discardDraftQuestionMock(questionId);
  }

  const { data } = await httpClient.delete<QuestionDTO>(questionRoutes.draft(questionId));
  return data;
}
