/**
 * Carrega uma pergunta da trilha para edicao do rascunho.
 * Sem `questionId` (tela de criacao) nao faz requisicao.
 */
import { useQuery } from '@tanstack/react-query';
import { toFillBlankQuestion } from '../api/fillBlankContract';
import { getQuestion } from '../api/getQuestion';
import { toLoadQuestionErrorMessage } from '../model/questionErrorMessages';
import { questionQueryKeys } from './questionQueryKeys';

export function useQuestion(questionId: string | undefined) {
  const query = useQuery({
    queryKey: questionQueryKeys.detail(questionId ?? ''),
    queryFn: () => getQuestion(questionId ?? ''),
    enabled: Boolean(questionId),
    select: toFillBlankQuestion,
  });

  return {
    question: query.data ?? null,
    isLoading: Boolean(questionId) && query.isPending,
    errorMessage: query.isError ? toLoadQuestionErrorMessage(query.error) : null,
    reload: () => {
      void query.refetch();
    },
  };
}
