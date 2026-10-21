/**
 * Salva o rascunho de uma pergunta "Preencher lacuna": POST na criacao e PUT na edicao.
 * O corpo enviado e montado por toFillBlankPayload (contrato C6).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestion } from '../api/createQuestion';
import { toFillBlankPayload, toFillBlankQuestion } from '../api/fillBlankContract';
import { updateQuestion } from '../api/updateQuestion';
import { toSaveQuestionErrorMessage } from '../model/questionErrorMessages';
import type { FillBlankFormValues, FillBlankQuestion, QuestionDTO } from '../types';
import { questionQueryKeys } from './questionQueryKeys';

type SaveFillBlankQuestionOptions = {
  categoryId: string;
  /** Sem id, cria a pergunta na categoria. */
  questionId?: string;
};

export function useSaveFillBlankQuestion({ categoryId, questionId }: SaveFillBlankQuestionOptions) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: FillBlankFormValues) => {
      const payload = toFillBlankPayload(values);
      return questionId ? updateQuestion(questionId, payload) : createQuestion(categoryId, payload);
    },
    onSuccess: (dto) => {
      // Atualiza a lista da categoria so se ela ja estiver em cache (veio de um GET completo).
      // Sem cache, nao cria uma lista so com esta pergunta: quem precisar da lista busca do GET.
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
