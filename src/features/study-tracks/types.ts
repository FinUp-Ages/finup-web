/**
 * Tipos da Trilha de estudos (contrato C6, card de backend 86e3m95y3).
 *
 * Os DTOs espelham o corpo e a resposta da API; FillBlankQuestion e FillBlankFormValues sao o
 * formato que a tela usa. A conversao entre os dois fica so em api/fillBlankContract.ts.
 */

/** Tipos de pergunta do C6. */
export type QuestionType = 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'LEARNING';

/**
 * Status derivado do C6. O PUT edita o rascunho em qualquer status: numa pergunta publicada,
 * a edicao deixa o status em PUBLISHED_WITH_CHANGES ate ser publicada de novo.
 */
export type QuestionStatus = 'DRAFT' | 'PUBLISHED' | 'PUBLISHED_WITH_CHANGES';

/** Corpo do POST e do PUT de uma pergunta "Preencher lacuna". */
export interface FillBlankQuestionPayload {
  type: 'FILL_BLANK';
  title: string;
  statement: string;
  answers: string[];
  explanation: string;
}

/** Conteudo de `draft` e `published`. Os outros tipos ainda nao tem formulario no painel. */
export type QuestionContentDTO =
  FillBlankQuestionPayload | { type: Exclude<QuestionType, 'FILL_BLANK'> };

/** Resposta do POST e do PUT e item do GET da categoria. */
export interface QuestionDTO {
  id: string;
  status: QuestionStatus;
  draft: QuestionContentDTO;
  published: QuestionContentDTO | null;
  updatedAt: string;
  publishedAt: string | null;
}

/** Valores editados no formulario "Preencher lacuna". */
export interface FillBlankFormValues {
  title: string;
  statement: string;
  answers: string[];
  explanation: string;
}

/** Pergunta carregada para edicao, no formato da tela (os valores vem do rascunho). */
export interface FillBlankQuestion {
  id: string;
  type: QuestionType;
  status: QuestionStatus;
  values: FillBlankFormValues;
}
