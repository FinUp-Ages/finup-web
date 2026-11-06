/**
 * Carrega uma pergunta de "Conteúdo explicativo" (LEARNING) para edição do rascunho.
 * Busca a lista da categoria e localiza pelo id da pergunta.
 * Sem questionId (criação), não faz requisição.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { toLearningQuestion } from '../api/learningContract';
import {
  questionNotFoundMessage,
  toLoadQuestionErrorMessage,
} from '../model/questionErrorMessages';
import type { QuestionDTO } from '../types';
import { questionQueryKeys } from './questionQueryKeys';

export function useLearningQuestion(categoryId: string, questionId: string | undefined) {
  const isEditing = Boolean(questionId);

  const selectQuestion = useCallback(
    (questions: QuestionDTO[]) => {
      const found = questions.find((question) => question.id === questionId);
      return found ? toLearningQuestion(found) : null;
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
