/**
 * Salva o rascunho de uma pergunta "Objetiva" (MULTIPLE_CHOICE): POST na criacao e PUT na edicao.
 * O corpo enviado e montado por toMultipleChoicePayload (contrato C6).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestion } from '../api/createQuestion';
import { toMultipleChoicePayload, toMultipleChoiceQuestion } from '../api/multipleChoiceContract';
import { updateQuestion } from '../api/updateQuestion';
import { toSaveQuestionErrorMessage } from '../model/questionErrorMessages';
import type { MultipleChoiceFormValues, MultipleChoiceQuestion, QuestionDTO } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';
import { questionQueryKeys } from './questionQueryKeys';

type SaveMultipleChoiceQuestionOptions = {
  categoryId: string;
  /** Sem id, cria a pergunta na categoria. */
  questionId?: string;
};

export function useSaveMultipleChoiceQuestion({
  categoryId,
  questionId,
}: SaveMultipleChoiceQuestionOptions) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: MultipleChoiceFormValues) => {
      const payload = toMultipleChoicePayload(values);
      return questionId ? updateQuestion(questionId, payload) : createQuestion(categoryId, payload);
    },
    onSuccess: (dto) => {
      // Atualiza a lista da categoria so se ela ja estiver em cache (veio de um GET completo).
      queryClient.setQueryData<QuestionDTO[]>(
        questionQueryKeys.categoryQuestions(categoryId),
        (questions) => {
          if (!questions) {
            return undefined;
          }
          return questions.some((question) => question.id === dto.id)
            ? questions.map((question) => (question.id === dto.id ? dto : question))
            : [...questions, dto];
        },
      );
      // Criar ou editar o rascunho pode mudar as contagens exibidas nas categorias.
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.list(), exact: true });
    },
  });

  return {
    save: (
      values: MultipleChoiceFormValues,
      onSaved: (question: MultipleChoiceQuestion) => void,
    ) => {
      mutation.mutate(values, { onSuccess: (dto) => onSaved(toMultipleChoiceQuestion(dto)) });
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? toSaveQuestionErrorMessage(mutation.error) : null,
  };
}

