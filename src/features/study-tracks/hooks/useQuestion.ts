/**
 * Carrega uma pergunta da trilha para edicao do rascunho.
 * O contrato nao tem GET de uma pergunta: busca a lista da categoria e procura pelo id.
 * Sem `questionId` (tela de criacao) nao faz requisicao.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toFillBlankQuestion } from '../api/fillBlankContract';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import {
  questionNotFoundMessage,
  toLoadQuestionErrorMessage,
} from '../model/questionErrorMessages';
import type { QuestionDTO } from '../types';
import { questionQueryKeys } from './questionQueryKeys';

export function useQuestion(categoryId: string, questionId: string | undefined) {
  const isEditing = Boolean(questionId);
  // Estavel por pergunta: o TanStack Query so roda o select de novo quando a lista muda.
  const selectQuestion = useCallback(
    (questions: QuestionDTO[]) => {
      const found = questions.find((question) => question.id === questionId);
      return found ? toFillBlankQuestion(found) : null;
    },
    [questionId],
  );

  const query = useQuery({
    queryKey: questionQueryKeys.categoryQuestions(categoryId),
    queryFn: () => getCategoryQuestions(categoryId),
    enabled: isEditing,
    select: selectQuestion,
  });

  // Falha num recarregamento com a pergunta ja na tela nao vira erro: o formulario continua.
  const hasData = query.data !== undefined;
  // enabled=false impede a busca, mas o observer ainda recebe o cache da categoria.
  // Na criacao nao ha pergunta para localizar: os estados de consulta sao so da edicao.
  const notFound = isEditing && query.isSuccess && query.data === null;
  const loadFailed = isEditing && query.isError && !hasData;

  return {
    question: isEditing ? (query.data ?? null) : null,
    isLoading: isEditing && query.isPending,
    errorMessage: loadFailed
      ? toLoadQuestionErrorMessage(query.error)
      : notFound
        ? questionNotFoundMessage
        : null,
    reload: () => {
      if (isEditing) void query.refetch();
    },
  };
}
