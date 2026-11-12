/**
 * Regras de validacao do formulario "Conteudo explicativo" (LEARNING).
 * Valida antes de enviar para a API (POST ou PUT) e devolve mensagens claras.
 */
import type { LearningFormValues } from '../types';

export const learningMessages = {
  titleRequired: 'Informe o título do conteúdo.',
  bodyRequired: 'Informe o corpo do conteúdo em markdown.',
} as const;

export type LearningErrors = {
  title?: string;
  body?: string;
};

/** Ordem dos campos na tela para foco acessivel no primeiro campo invalido. */
export const learningFieldOrder: (keyof LearningErrors)[] = ['title', 'body'];

export function validateLearningQuestion(
  values: Pick<LearningFormValues, 'title' | 'body'>,
): LearningErrors {
  const errors: LearningErrors = {};

  if (!values.title || !values.title.trim()) {
    errors.title = learningMessages.titleRequired;
  }

  if (!values.body || !values.body.trim()) {
    errors.body = learningMessages.bodyRequired;
  }

  return errors;
}
