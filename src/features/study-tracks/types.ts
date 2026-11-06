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

/** Alternativa de uma pergunta "Objetiva" (Múltipla escolha) no contrato C6. */
export interface MultipleChoiceOptionDTO {
  text: string;
  correct: boolean;
}

/** Corpo do POST e do PUT de uma pergunta "Objetiva" (Múltipla escolha). */
export interface MultipleChoiceQuestionPayload {
  type: 'MULTIPLE_CHOICE';
  statement: string;
  options: MultipleChoiceOptionDTO[];
  explanation: string;
}

/** Metadados de leitura dos tipos cujos formularios pertencem a outras tasks. */
export interface MultipleChoiceContentDTO {
  type: 'MULTIPLE_CHOICE';
  statement?: string;
  options?: MultipleChoiceOptionDTO[];
  explanation?: string;
}

export interface LearningContentDTO {
  type: 'LEARNING';
  title?: string;
  body?: string;
}

/** Conteudo de `draft` e `published`, incluindo os metadados usados pela listagem. */
export type QuestionContentDTO =
  | FillBlankQuestionPayload
  | MultipleChoiceQuestionPayload
  | MultipleChoiceContentDTO
  | LearningContentDTO;

/** Corpo do POST e do PUT de uma pergunta "Conteúdo explicativo / educativo". */
export interface LearningQuestionPayload {
  type: 'LEARNING';
  title: string;
  body: string;
}

/** Uniao dos payloads suportados no POST e PUT de perguntas. */
export type QuestionPayload =
  | FillBlankQuestionPayload
  | MultipleChoiceQuestionPayload
  | LearningQuestionPayload;

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

/** Valores editados no formulario "Conteúdo explicativo". */
export interface LearningFormValues {
  title: string;
  body: string;
}

/** Conteúdo explicativo carregado para edicao. */
export interface LearningQuestion {
  id: string;
  type: 'LEARNING';
  status: QuestionStatus;
  values: LearningFormValues;
}

/** Pergunta carregada para edicao, no formato da tela (os valores vem do rascunho). */
export interface FillBlankQuestion {
  id: string;
  type: QuestionType;
  status: QuestionStatus;
  values: FillBlankFormValues;
}

/** Valores editados no formulario de pergunta "Objetiva" (Múltipla escolha). */
export interface MultipleChoiceFormValues {
  statement: string;
  options: MultipleChoiceOptionDTO[];
  explanation: string;
}

/** Pergunta "Objetiva" carregada para edicao, no formato da tela (os valores vem do rascunho). */
export interface MultipleChoiceQuestion {
  id: string;
  type: QuestionType;
  status: QuestionStatus;
  values: MultipleChoiceFormValues;
}
