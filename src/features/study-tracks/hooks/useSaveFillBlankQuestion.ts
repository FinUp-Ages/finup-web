/**
 * Salva o rascunho de uma pergunta "Preencher lacuna": POST na criacao e PUT na edicao.
 * O corpo enviado e montado por toFillBlankPayload (contrato C6).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestion } from '../api/createQuestion';
import { toFillBlankPayload, toFillBlankQuestion } from '../api/fillBlankContract';
import { updateQuestion } from '../api/updateQuestion';
import { toSaveQuestionErrorMessage } from '../model/questionErrorMessages';
import type { FillBlankFormValues, FillBlankQuestion } from '../types';
import { questionQueryKeys } from './questionQueryKeys';

/** Criacao dentro de uma categoria ou edicao de uma pergunta existente. */
export type SaveTarget = { categoryId: string } | { questionId: string };

export function useSaveFillBlankQuestion(target: SaveTarget) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: FillBlankFormValues) => {
      const payload = toFillBlankPayload(values);
      return 'questionId' in target
        ? updateQuestion(target.questionId, payload)
        : createQuestion(target.categoryId, payload);
    },
    onSuccess: (dto) => {
      // A tela de edicao abre com o rascunho salvo, sem nova requisicao.
      queryClient.setQueryData(questionQueryKeys.detail(dto.id), dto);
    },
  });

  return {
    save: (values: FillBlankFormValues, onSaved: (question: FillBlankQuestion) => void) => {
      mutation.mutate(values, { onSuccess: (dto) => onSaved(toFillBlankQuestion(dto)) });
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? toSaveQuestionErrorMessage(mutation.error) : null,
  };
}
