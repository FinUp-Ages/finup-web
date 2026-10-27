/**
 * API simulada das perguntas da trilha (contrato C6), usada quando VITE_USE_MOCKS=true enquanto
 * o finup-backend nao tem as rotas. Guarda as perguntas em memoria (somem ao recarregar).
 *
 * Fixtures da categoria "categoria-reserva", para validar a tela a mao em
 * /app/studies/categories/categoria-reserva/questions/<id>/edit:
 * - pergunta-rascunho: FILL_BLANK em DRAFT;
 * - pergunta-publicada: FILL_BLANK publicada, sem alteracoes (editar vira PUBLISHED_WITH_CHANGES);
 * - pergunta-com-alteracoes: FILL_BLANK publicada com rascunho diferente;
 * - pergunta-multipla-escolha e conteudo-educativo: tipos com formularios em outras tasks.
 * A categoria "categoria-inexistente" responde 404.
 */
import { ApiError } from '@/shared/config/apiError';
import type { ProblemDetail } from '@/shared/types/problemDetail';
import { validateFillBlankQuestion } from '../model/fillBlankValidation';
import type {
  CategoryDTO,
  FillBlankQuestionPayload,
  QuestionContentDTO,
  QuestionDTO,
  QuestionStatus,
} from '../types';

const MOCK_LATENCY_MS = 400;

export const MISSING_CATEGORY_ID = 'categoria-inexistente';

/** Pergunta guardada: o status nao e gravado, e derivado como no backend. */
type StoredQuestion = Omit<QuestionDTO, 'status'> & { categoryId: string };

const publishedLiquidity: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Liquidez da reserva',
  statement: 'A reserva de emergência deve ter alta ___',
  answers: ['liquidez'],
  explanation: 'Alta liquidez permite o resgate imediato.',
};

const publishedRisk: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Risco da reserva',
  statement: 'A reserva de emergência deve ter baixo ___',
  answers: ['risco'],
  explanation: '',
};

const initialQuestions: StoredQuestion[] = [
  {
    id: 'pergunta-rascunho',
    categoryId: 'categoria-reserva',
    draft: {
      type: 'FILL_BLANK',
      title: 'Rendimento do CDB',
      statement: 'O CDB rende ___ do CDI',
      answers: ['100%', 'cem por cento'],
      explanation: 'CDBs de liquidez diária costumam render 100% do CDI.',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
  {
    id: 'pergunta-publicada',
    categoryId: 'categoria-reserva',
    draft: publishedLiquidity,
    published: publishedLiquidity,
    updatedAt: '2026-10-18T12:00:00Z',
    publishedAt: '2026-10-18T12:00:00Z',
  },
  {
    id: 'pergunta-com-alteracoes',
    categoryId: 'categoria-reserva',
    draft: { ...publishedRisk, answers: ['risco', 'risco de perda'] },
    published: publishedRisk,
    updatedAt: '2026-10-19T12:00:00Z',
    publishedAt: '2026-10-17T12:00:00Z',
  },
  {
    id: 'pergunta-multipla-escolha',
    categoryId: 'categoria-reserva',
    draft: {
      type: 'MULTIPLE_CHOICE',
      statement: 'Onde guardar a reserva de emergência?',
      options: [
        { text: 'Em um investimento de alta liquidez e baixo risco', correct: true },
        { text: 'Em um investimento sem possibilidade de resgate imediato', correct: false },
      ],
      explanation: 'A reserva precisa estar disponível para imprevistos.',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
  {
    id: 'conteudo-educativo',
    categoryId: 'categoria-reserva',
    draft: {
      type: 'LEARNING',
      title: 'Por que ter uma reserva de emergência?',
      body: 'Uma **reserva de emergência** ajuda a enfrentar despesas inesperadas.',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
];

let questions: StoredQuestion[] = [];
/** Ids sequenciais: crypto.randomUUID so existe em HTTPS ou localhost (quebraria pelo IP da rede). */
let nextQuestionNumber = 1;

/** Volta o store as fixtures (usado tambem pelos testes). */
export function resetQuestionsMock(): void {
  questions = initialQuestions.map((question) => ({ ...question }));
  nextQuestionNumber = 1;
}

resetQuestionsMock();

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

function problem(status: number, title: string, detail: string): ApiError {
  const body: ProblemDetail = { type: 'about:blank', title, status, detail };
  return new ApiError(status, body);
}

/** Mesma comparacao do backend (draft igual a published). As chaves seguem a mesma ordem. */
function sameContent(a: QuestionContentDTO, b: QuestionContentDTO): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function deriveStatus({ draft, published }: StoredQuestion): QuestionStatus {
  if (!published) {
    return 'DRAFT';
  }
  return sameContent(draft, published) ? 'PUBLISHED' : 'PUBLISHED_WITH_CHANGES';
}

/** As categorias usam o mesmo store de perguntas, sem contagens fixas independentes. */
export function getCategoryQuestionCountsMock(
  categoryId: string,
): Pick<CategoryDTO, 'draftCount' | 'publishedCount'> {
  let draftCount = 0;
  let publishedCount = 0;
  for (const question of questions) {
    if (question.categoryId !== categoryId) continue;
    const status = deriveStatus(question);
    if (status !== 'PUBLISHED') draftCount += 1;
    if (status !== 'DRAFT') publishedCount += 1;
  }
  return { draftCount, publishedCount };
}

/** A resposta do contrato nao traz a categoria. */
function toDTO(stored: StoredQuestion): QuestionDTO {
  return {
    id: stored.id,
    status: deriveStatus(stored),
    draft: stored.draft,
    published: stored.published,
    updatedAt: stored.updatedAt,
    publishedAt: stored.publishedAt,
  };
}

function assertCategoryExists(categoryId: string): void {
  if (categoryId === MISSING_CATEGORY_ID) {
    throw problem(404, 'Not Found', 'Categoria não encontrada.');
  }
}

/** Mesmas regras do formulario, como o backend faria no 400. */
function assertValidPayload(payload: FillBlankQuestionPayload): void {
  const errors = validateFillBlankQuestion(payload);
  const firstError = errors.title ?? errors.statement ?? errors.answers;
  if (payload.type !== 'FILL_BLANK' || firstError) {
    throw problem(400, 'Bad Request', firstError ?? 'Corpo da pergunta inválido.');
  }
}

export async function getCategoryQuestionsMock(categoryId: string): Promise<QuestionDTO[]> {
  await wait();
  assertCategoryExists(categoryId);
  return questions.filter((question) => question.categoryId === categoryId).map(toDTO);
}

export async function createQuestionMock(
  categoryId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  await wait();
  assertCategoryExists(categoryId);
  assertValidPayload(payload);

  const created: StoredQuestion = {
    id: `pergunta-nova-${nextQuestionNumber++}`,
    categoryId,
    draft: payload,
    published: null,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
  };
  questions = [...questions, created];
  return toDTO(created);
}

export async function updateQuestionMock(
  questionId: string,
  payload: FillBlankQuestionPayload,
): Promise<QuestionDTO> {
  await wait();
  const current = questions.find((item) => item.id === questionId);
  if (!current) {
    throw problem(404, 'Not Found', 'Pergunta não encontrada.');
  }
  assertValidPayload(payload);

  // So o rascunho muda; a versao publicada fica como esta.
  const updated: StoredQuestion = {
    ...current,
    draft: payload,
    updatedAt: new Date().toISOString(),
  };
  questions = questions.map((item) => (item.id === questionId ? updated : item));
  return toDTO(updated);
}
