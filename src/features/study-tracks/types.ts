/**
 * Tipos da Trilha de estudos (contrato C6).
 *
 * Os DTOs espelham o corpo e a resposta da API em /api/v1/admin/study-tracks (categorias e
 * perguntas). FillBlankQuestion e FillBlankFormValues sao o formato que a tela da pergunta
 * "Preencher lacuna" usa; a conversao fica so em api/fillBlankContract.ts.
 */

/** Corpo do POST e do PUT de uma categoria. */
export interface CategoryPayload {
  name: string;
  description: string;
}

/** Resposta do POST (201), do PUT e de cada item do GET de categorias. */
export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  /** Perguntas em DRAFT ou PUBLISHED_WITH_CHANGES. */
  draftCount: number;
  /** Perguntas em PUBLISHED ou PUBLISHED_WITH_CHANGES. */
  publishedCount: number;
  createdAt: string;
  updatedAt: string;
}

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

/** Metadados de leitura dos tipos cujos formularios pertencem a outras tasks. */
export interface MultipleChoiceContentDTO {
  type: 'MULTIPLE_CHOICE';
  statement?: string;
  options?: { text: string; correct: boolean }[];
  explanation?: string;
}

export interface LearningContentDTO {
  type: 'LEARNING';
  title?: string;
  body?: string;
}

/** Conteudo de `draft` e `published`, incluindo os metadados usados pela listagem. */
export type QuestionContentDTO =
  FillBlankQuestionPayload | MultipleChoiceContentDTO | LearningContentDTO;

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
