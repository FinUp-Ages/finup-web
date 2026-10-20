/**
 * Tipos da Trilha de estudos (contrato C6).
 *
 * Os DTOs espelham o corpo e a resposta da API; FillBlankQuestion e FillBlankFormValues sao o
 * formato que a tela usa. A conversao entre os dois fica so em api/fillBlankContract.ts.
 */

/** Tipos de pergunta do C6. */
export type QuestionType = 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'LEARNING';

/** Status derivado do C6: so DRAFT pode ser editado pelo painel. */
export type QuestionStatus = 'DRAFT' | 'PUBLISHED' | 'PUBLISHED_WITH_CHANGES';

/** Corpo do POST e do PUT de uma pergunta "Preencher lacuna" (card C6). */
export interface FillBlankQuestionPayload {
  type: 'FILL_BLANK';
  title: string;
  statement: string;
  answers: string[];
  explanation: string;
}

/**
 * Resposta do POST, do PUT e do GET de uma pergunta.
 * PREMISSA: o C6 ainda nao define a resposta; assume o corpo do rascunho mais id, categoria e
 * status. Os campos do rascunho so existem quando o tipo e FILL_BLANK.
 */
export interface QuestionDTO {
  id: string;
  categoryId: string;
  type: QuestionType;
  status: QuestionStatus;
  title?: string;
  statement?: string;
  answers?: string[];
  explanation?: string;
}

/** Valores editados no formulario "Preencher lacuna". */
export interface FillBlankFormValues {
  title: string;
  statement: string;
  answers: string[];
  explanation: string;
}

/** Pergunta carregada para edicao, no formato da tela. */
export interface FillBlankQuestion {
  id: string;
  categoryId: string;
  type: QuestionType;
  status: QuestionStatus;
  values: FillBlankFormValues;
}
