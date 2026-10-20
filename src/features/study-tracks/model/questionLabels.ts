/** Rotulos em portugues dos tipos e status de pergunta do C6. */
import type { QuestionStatus, QuestionType } from '../types';

export const questionTypeLabels: Record<QuestionType, string> = {
  FILL_BLANK: 'Preencher lacuna',
  MULTIPLE_CHOICE: 'Múltipla escolha',
  LEARNING: 'Conteúdo educativo',
};

export const questionStatusLabels: Record<QuestionStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicada',
  PUBLISHED_WITH_CHANGES: 'Publicada com alterações',
};
