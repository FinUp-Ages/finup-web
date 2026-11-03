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

/** Converte valores do formulário para o payload de envio (POST/PUT). */
export function toLearningPayload(values: LearningFormValues): LearningQuestionPayload {
  return {
    type: 'LEARNING',
    title: values.title.trim(),
    body: values.body.trim(),
  };
}

/** Converte o DTO retornado pela API no modelo de tela de Conteúdo explicativo. */
export function toLearningQuestion(dto: QuestionDTO): LearningQuestion | null {
  if (dto.draft.type !== 'LEARNING') {
    return null;
  }

  const draft = dto.draft as { title?: string; body?: string };

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
