/**
 * Conversões e regras do contrato C6 para "Conteúdo explicativo" (LEARNING).
 * Isola o formato do backend do modelo de tela utilizado nos formulários.
 */
import type {
  LearningFormValues,
  LearningQuestion,
  LearningQuestionPayload,
  QuestionDTO,
} from '../types';

/**
 * Converte valores do formulário para o payload de envio (POST/PUT).
 * O corpo vai como foi digitado: o C6 preserva o Markdown (indentação inicial pode ser código).
 */
export function toLearningPayload(values: LearningFormValues): LearningQuestionPayload {
  return {
    type: 'LEARNING',
    title: values.title.trim(),
    body: values.body,
  };
}

/** Converte o DTO retornado pela API no modelo de tela de Conteúdo explicativo. */
export function toLearningQuestion(dto: QuestionDTO): LearningQuestion | null {
  const { draft } = dto;
  if (draft.type !== 'LEARNING') {
    return null;
  }

  return {
    id: dto.id,
    type: 'LEARNING',
    status: dto.status,
    values: {
      title: draft.title ?? '',
      body: draft.body ?? '',
    },
  };
}
