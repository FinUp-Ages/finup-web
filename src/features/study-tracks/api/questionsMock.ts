/**
 * API simulada das perguntas da trilha (contrato C6), usada quando VITE_USE_MOCKS=true enquanto
 * o finup-backend nao tem as rotas de escrita. Guarda as perguntas em memoria (somem ao recarregar).
 *
 * Fixtures para validar a tela a mao:
 * - /app/studies/questions/pergunta-rascunho/edit: FILL_BLANK em DRAFT (editavel);
 * - /app/studies/questions/pergunta-publicada/edit: FILL_BLANK publicada (somente leitura, PUT 409);
 * - /app/studies/questions/pergunta-multipla-escolha/edit: tipo sem formulario no painel;
 * - categoria "categoria-inexistente" na criacao: 404.
 */
import { ApiError } from '@/shared/config/apiError';
import type { ProblemDetail } from '@/shared/types/problemDetail';
import { validateFillBlankQuestion } from '../model/fillBlankValidation';
import type { FillBlankQuestionPayload, QuestionDTO } from '../types';

const MOCK_LATENCY_MS = 400;

export const MISSING_CATEGORY_ID = 'categoria-inexistente';

const initialQuestions: QuestionDTO[] = [
  {
    id: 'pergunta-rascunho',
    categoryId: 'categoria-reserva',
    type: 'FILL_BLANK',
    status: 'DRAFT',
    title: 'Rendimento do CDB',
    statement: 'O CDB rende ___ do CDI',
    answers: ['100%', 'cem por cento'],
    explanation: 'CDBs de liquidez diária costumam render 100% do CDI.',
  },
  {
    id: 'pergunta-publicada',
    categoryId: 'categoria-reserva',
    type: 'FILL_BLANK',
    status: 'PUBLISHED',
    title: 'Liquidez da reserva',
    statement: 'A reserva de emergência deve ter alta ___',
    answers: ['liquidez'],
    explanation: 'Alta liquidez permite o resgate imediato.',
  },
  {
    id: 'pergunta-multipla-escolha',
    categoryId: 'categoria-reserva',
    type: 'MULTIPLE_CHOICE',
    status: 'DRAFT',
  },
];

let questions: QuestionDTO[] = [];

/** Volta o store as fixtures (usado tambem pelos testes). */
export function resetQuestionsMock(): void {
  questions = initialQuestions.map((question) => ({ ...question }));
}

resetQuestionsMock();

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

function problem(status: number, title: string, detail: string): ApiError {
  const body: ProblemDetail = { type: 'about:blank', title, status, detail };
  return new ApiError(status, body);
}

/** Mesmas regras do formulario, como o backend faria no 400. */
function assertValidPayload(payload: FillBlankQuestionPayload): void {
  const errors = validateFillBlankQuestion(payload);
  const firstError = errors.title ?? errors.statement ?? errors.answers;
  if (payload.type !== 'FILL_BLANK' || firstError) {
    throw problem(400, 'Bad Request', firstError ?? 'Corpo da pergunta inválido.');
  }
}

function findQuestion(questionId: string): QuestionDTO {
  const question = questions.find((item) => item.id === questionId);
  if (!question) {
    throw problem(404, 'Not Found', 'Pergunta não encontrada.');
  }
  return question;
}

export async function getQuestionMock(questionId: string): Promise<QuestionDTO> {
  await wait();
  return { ...findQuestion(questionId) };
}

export async function createQuestionMock(
  categoryId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  await wait();
  if (categoryId === MISSING_CATEGORY_ID) {
    throw problem(404, 'Not Found', 'Categoria não encontrada.');
  }
  assertValidPayload(payload);

  const created: QuestionDTO = { ...payload, id: crypto.randomUUID(), categoryId, status: 'DRAFT' };
  questions = [...questions, created];
  return { ...created };
}

export async function updateQuestionMock(
  questionId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  await wait();
  const current = findQuestion(questionId);
  if (current.status !== 'DRAFT') {
    throw problem(409, 'Conflict', 'Somente perguntas em rascunho podem ser editadas.');
  }
  assertValidPayload(payload);

  const updated: QuestionDTO = { ...current, ...payload };
  questions = questions.map((item) => (item.id === questionId ? updated : item));
  return { ...updated };
}
