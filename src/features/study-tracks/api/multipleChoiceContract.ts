/**
 * Conversoes do contrato C6 para pergunta "Objetiva" (MULTIPLE_CHOICE).
 * Isola o formato da API do formato utilizado no formulario da tela.
 */
import type {
  MultipleChoiceFormValues,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionPayload,
  QuestionDTO,
} from '../types';

/** Formulario -> corpo MULTIPLE_CHOICE do C6, com os textos aparados. */
export function toMultipleChoicePayload(
  values: MultipleChoiceFormValues,
): MultipleChoiceQuestionPayload {
  return {
    type: 'MULTIPLE_CHOICE',
    statement: values.statement.trim(),
    options: values.options.map((option) => ({
      text: option.text.trim(),
      correct: Boolean(option.correct),
    })),
    explanation: values.explanation.trim(),
  };
}

/** Resposta da API -> pergunta no formato da tela, com os valores do rascunho. */
export function toMultipleChoiceQuestion(dto: QuestionDTO): MultipleChoiceQuestion {
  const draft = dto.draft.type === 'MULTIPLE_CHOICE' ? dto.draft : null;
  return {
    id: dto.id,
    type: dto.draft.type,
    status: dto.status,
    values: {
      statement: draft?.statement ?? '',
      options: (draft?.options ?? []).map((option) => ({
        text: option.text ?? '',
        correct: Boolean(option.correct),
      })),
      explanation: draft?.explanation ?? '',
    },
  };
}

