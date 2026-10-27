import type { QuestionContentDTO } from '../types';

/** A pergunta objetiva usa o enunciado: o C6 nao define um title para esse tipo. */
export function questionTitle(content: QuestionContentDTO): string {
  const title = content.type === 'MULTIPLE_CHOICE' ? content.statement : content.title;
  return title?.trim() || 'Sem título';
}
