/**
 * Ponto unico da feature que conhece o formato do contrato C6 para "Preencher lacuna", conforme o
 * card de backend 86e3m95y3 ("API de perguntas da Trilha: escrita").
 *
 * Quando o finup-backend publicar as rotas, ajustes de caminho, corpo e resposta ficam neste
 * arquivo; createQuestion, updateQuestion, getCategoryQuestions e a tela nao mudam.
 *
 * - POST e GET em /api/v1/admin/study-tracks/categories/{categoryId}/questions.
 * - PUT /questions/{id} edita so o `draft`, em qualquer status, nunca o `published`.
 * - Resposta: { id, status, draft, published, updatedAt, publishedAt }.
 * - Nao ha GET de uma pergunta: a edicao procura a pergunta no GET da categoria.
 *
 * PREMISSAS: o card escreve o PUT como "/questions/{id}" sem prefixo; assume o mesmo prefixo
 * /api/v1/admin/study-tracks. Assume tambem que o GET da categoria devolve uma lista de
 * QuestionDTO, no formato da resposta do POST.
 */
import type {
  FillBlankFormValues,
  FillBlankQuestion,
  FillBlankQuestionPayload,
  QuestionDTO,
} from '../types';

const STUDY_TRACKS_ADMIN_PATH = '/api/v1/admin/study-tracks';

export const questionRoutes = {
  /** POST cria a pergunta (nasce como rascunho) e GET lista as perguntas da categoria. */
  categoryQuestions: (categoryId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/categories/${encodeURIComponent(categoryId)}/questions`,
  /** PUT atualiza o rascunho. */
  question: (questionId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/questions/${encodeURIComponent(questionId)}`,
  /** POST publica a pergunta (copia o rascunho para a versao no ar). */
  publish: (questionId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/questions/${encodeURIComponent(questionId)}/publish`,
  /** POST volta a pergunta para rascunho (remove a versao no ar). */
  unpublish: (questionId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/questions/${encodeURIComponent(questionId)}/unpublish`,
  /** DELETE descarta alteracoes pendentes no rascunho (reverte para o publicado). */
  draft: (questionId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/questions/${encodeURIComponent(questionId)}/draft`,
};

/** Formulario -> corpo FILL_BLANK, sem campos extras e com os textos aparados. */
export function toFillBlankPayload(values: FillBlankFormValues): FillBlankQuestionPayload {
  return {
    type: 'FILL_BLANK',
    title: values.title.trim(),
    statement: values.statement.trim(),
    answers: values.answers.map((answer) => answer.trim()).filter(Boolean),
    explanation: values.explanation.trim(),
  };
}

/** Resposta da API -> pergunta no formato da tela, com os valores do rascunho. */
export function toFillBlankQuestion(dto: QuestionDTO): FillBlankQuestion {
  const draft = dto.draft.type === 'FILL_BLANK' ? dto.draft : null;
  return {
    id: dto.id,
    type: dto.draft.type,
    status: dto.status,
    values: {
      title: draft?.title ?? '',
      statement: draft?.statement ?? '',
      answers: draft?.answers ?? [],
      explanation: draft?.explanation ?? '',
    },
  };
}
