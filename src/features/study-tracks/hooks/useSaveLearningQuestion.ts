/**
 * Salva o rascunho de uma pergunta "Conteúdo explicativo" (LEARNING): POST na criação e PUT na edição.
 * O corpo enviado é montado por toLearningPayload (contrato C6).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestion } from '../api/createQuestion';
import { toLearningPayload, toLearningQuestion } from '../api/learningContract';
import { updateQuestion } from '../api/updateQuestion';
import { toSaveQuestionErrorMessage } from '../model/questionErrorMessages';
import type { LearningFormValues, LearningQuestion, QuestionDTO } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';
import { questionQueryKeys } from './questionQueryKeys';

type SaveLearningQuestionOptions = {
  categoryId: string;
  /** Sem id, cria a pergunta na categoria. */
  questionId?: string;
};

export function useSaveLearningQuestion({ categoryId, questionId }: SaveLearningQuestionOptions) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: LearningFormValues) => {
      const payload = toLearningPayload(values);
      return questionId ? updateQuestion(questionId, payload) : createQuestion(categoryId, payload);
    },
    onSuccess: (dto) => {
      // Atualiza a lista da categoria só se ela já estiver em cache.
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
      // Criar ou editar o rascunho pode alterar contagens exibidas na lista de categorias.
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.list(), exact: true });
    },
  });

  return {
    save: (values: LearningFormValues, onSaved: (question: LearningQuestion) => void) => {
      mutation.mutate(values, {
        onSuccess: (dto) => {
          const converted = toLearningQuestion(dto);
          if (converted) {
            onSaved(converted);
          }
        },
      });
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? toSaveQuestionErrorMessage(mutation.error) : null,
  };
}
