/**
 * Carrega uma pergunta "Objetiva" (MULTIPLE_CHOICE) da trilha para edicao do rascunho.
 * O contrato nao tem GET de uma pergunta: busca a lista da categoria e procura pelo id.
 * Sem `questionId` (tela de criacao) nao faz requisicao.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { toMultipleChoiceQuestion } from '../api/multipleChoiceContract';
import {
  questionNotFoundMessage,
  toLoadQuestionErrorMessage,
} from '../model/questionErrorMessages';
import type { QuestionDTO } from '../types';
import { questionQueryKeys } from './questionQueryKeys';

export function useMultipleChoiceQuestion(categoryId: string, questionId: string | undefined) {
  const isEditing = Boolean(questionId);

  const selectQuestion = useCallback(
    (questions: QuestionDTO[]) => {
      const found = questions.find((question) => question.id === questionId);
      return found ? toMultipleChoiceQuestion(found) : null;
    },
    [questionId],
  );

  const query = useQuery({
    queryKey: questionQueryKeys.categoryQuestions(categoryId),
    queryFn: () => getCategoryQuestions(categoryId),
    enabled: isEditing,
    select: selectQuestion,
  });

  const hasData = query.data !== undefined;
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

