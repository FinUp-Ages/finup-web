/**
 * Ponto unico da feature que conhece o formato do contrato C6 para "Preencher lacuna".
 *
 * Quando o finup-backend publicar as rotas de escrita, os ajustes de caminho, corpo e resposta
 * ficam neste arquivo; createQuestion, updateQuestion, getQuestion e a tela nao mudam.
 *
 * PREMISSAS (C6 sem rotas de escrita nem GET do admin em nenhuma branch do backend em 2026-10-20):
 * - prefixo /api/v1/admin/study-tracks, como as demais rotas do painel em /api/v1/admin;
 * - corpo do card ({ type, title, statement, answers, explanation }), que diverge do schema
 *   FILL_BLANK de contracts/study-track-c6.md ({ textWithBlanks, blanks, explanation });
 * - resposta plana (QuestionDTO), com o rascunho no mesmo nivel de id, categoryId e status.
 */
import type {
  FillBlankFormValues,
  FillBlankQuestion,
  FillBlankQuestionPayload,
  QuestionDTO,
} from '../types';

const STUDY_TRACKS_ADMIN_PATH = '/api/v1/admin/study-tracks';

export const questionRoutes = {
  /** POST: cria a pergunta, que nasce como rascunho. */
  categoryQuestions: (categoryId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/categories/${encodeURIComponent(categoryId)}/questions`,
  /** GET carrega e PUT atualiza o rascunho. */
  question: (questionId: string) =>
    `${STUDY_TRACKS_ADMIN_PATH}/questions/${encodeURIComponent(questionId)}`,
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

/** Resposta da API -> pergunta no formato da tela. */
export function toFillBlankQuestion(dto: QuestionDTO): FillBlankQuestion {
  return {
    id: dto.id,
    categoryId: dto.categoryId,
    type: dto.type,
    status: dto.status,
    values: {
      title: dto.title ?? '',
      statement: dto.statement ?? '',
      answers: dto.answers ?? [],
      explanation: dto.explanation ?? '',
    },
  };
}
