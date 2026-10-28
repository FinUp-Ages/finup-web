/**
 * Hook para as acoes de ciclo de vida da pergunta (contrato C6):
 * - Publicar (POST /questions/{id}/publish)
 * - Voltar para rascunho (POST /questions/{id}/unpublish)
 * - Descartar alteracoes (DELETE /questions/{id}/draft)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discardDraftQuestion } from '../api/discardDraftQuestion';
import { publishQuestion } from '../api/publishQuestion';
import { unpublishQuestion } from '../api/unpublishQuestion';
import {
  toDiscardDraftErrorMessage,
  toPublishQuestionErrorMessage,
  toUnpublishQuestionErrorMessage,
} from '../model/questionErrorMessages';
import type { QuestionDTO } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';
import { questionQueryKeys } from './questionQueryKeys';

type QuestionActionsOptions = {
  categoryId?: string;
};

export function useQuestionActions({ categoryId }: QuestionActionsOptions = {}) {
  const queryClient = useQueryClient();

  function updateCache(dto: QuestionDTO) {
    if (categoryId) {
      queryClient.setQueryData<QuestionDTO[]>(
        questionQueryKeys.categoryQuestions(categoryId),
        (questions) => {
          if (!questions) return undefined;
          return questions.map((q) => (q.id === dto.id ? dto : q));
        },
      );
    }
    // Invalida categorias para atualizar contagens agregadas (draftCount e publishedCount)
    void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.list(), exact: true });
  }

  const publishMutation = useMutation({
    mutationFn: (questionId: string) => publishQuestion(questionId),
    onSuccess: (dto) => {
      updateCache(dto);
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (questionId: string) => unpublishQuestion(questionId),
    onSuccess: (dto) => {
      updateCache(dto);
    },
  });

  const discardDraftMutation = useMutation({
    mutationFn: (questionId: string) => discardDraftQuestion(questionId),
    onSuccess: (dto) => {
      updateCache(dto);
    },
  });

  return {
    publish: (questionId: string, onSuccess?: (dto: QuestionDTO) => void) => {
      publishMutation.mutate(questionId, { onSuccess });
    },
    isPublishing: publishMutation.isPending,
    publishError: publishMutation.isError
      ? toPublishQuestionErrorMessage(publishMutation.error)
      : null,
    resetPublishError: publishMutation.reset,

    unpublish: (questionId: string, onSuccess?: (dto: QuestionDTO) => void) => {
      unpublishMutation.mutate(questionId, { onSuccess });
    },
    isUnpublishing: unpublishMutation.isPending,
    unpublishError: unpublishMutation.isError
      ? toUnpublishQuestionErrorMessage(unpublishMutation.error)
      : null,
    resetUnpublishError: unpublishMutation.reset,

    discardDraft: (questionId: string, onSuccess?: (dto: QuestionDTO) => void) => {
      discardDraftMutation.mutate(questionId, { onSuccess });
    },
    isDiscarding: discardDraftMutation.isPending,
    discardError: discardDraftMutation.isError
      ? toDiscardDraftErrorMessage(discardDraftMutation.error)
      : null,
    resetDiscardError: discardDraftMutation.reset,

    isAnyPending:
      publishMutation.isPending || unpublishMutation.isPending || discardDraftMutation.isPending,
  };
}
