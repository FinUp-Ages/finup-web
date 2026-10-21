/**
 * Carrega uma pergunta da trilha para edicao do rascunho.
 * O contrato nao tem GET de uma pergunta: busca a lista da categoria e procura pelo id.
 * Sem `questionId` (tela de criacao) nao faz requisicao.
 */
import { useQuery } from '@tanstack/react-query';
import { toFillBlankQuestion } from '../api/fillBlankContract';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import {
  questionNotFoundMessage,
  toLoadQuestionErrorMessage,
} from '../model/questionErrorMessages';
import { questionQueryKeys } from './questionQueryKeys';

export function useQuestion(categoryId: string, questionId: string | undefined) {
  const query = useQuery({
    queryKey: questionQueryKeys.categoryQuestions(categoryId),
    queryFn: () => getCategoryQuestions(categoryId),
    enabled: Boolean(questionId),
    select: (questions) => {
      const found = questions.find((question) => question.id === questionId);
      return found ? toFillBlankQuestion(found) : null;
    },
  });

  const notFound = query.isSuccess && query.data === null;

  return {
    question: query.data ?? null,
    isLoading: Boolean(questionId) && query.isPending,
    errorMessage: query.isError
      ? toLoadQuestionErrorMessage(query.error)
      : notFound
        ? questionNotFoundMessage
        : null,
    reload: () => {
      void query.refetch();
    },
  };
}
