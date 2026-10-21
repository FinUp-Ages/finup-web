/**
 * API simulada das categorias da trilha (contrato C6), usada quando VITE_USE_MOCKS=true enquanto
 * o finup-backend nao tem as rotas. Guarda as categorias em memoria (somem ao recarregar).
 *
 * Fixtures para validar a tela a mao:
 * - "Reserva de emergência" e "Investimentos" tem perguntas: o DELETE responde 409;
 * - "Orçamento pessoal" esta vazia: o DELETE responde 204.
 */
import { ApiError } from '@/shared/config/apiError';
import type { ProblemDetail } from '@/shared/types/problemDetail';
import { validateCategory } from '../model/categoryValidation';
import type { CategoryDTO, CategoryPayload } from '../types';

const MOCK_LATENCY_MS = 400;

const initialCategories: CategoryDTO[] = [
  {
    id: 'categoria-reserva',
    name: 'Reserva de emergência',
    description: 'Por que guardar dinheiro para imprevistos e onde deixar essa reserva.',
    draftCount: 2,
    publishedCount: 5,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-10-10T15:30:00Z',
  },
  {
    id: 'categoria-investimentos',
    name: 'Investimentos',
    description: 'Renda fixa, renda variável e como comparar rendimentos.',
    draftCount: 0,
    publishedCount: 8,
    createdAt: '2026-09-05T12:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'categoria-orcamento',
    name: 'Orçamento pessoal',
    description: '',
    draftCount: 0,
    publishedCount: 0,
    createdAt: '2026-10-15T12:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
];

let categories: CategoryDTO[] = [];

/** Volta o store as fixtures. */
export function resetCategoriesMock(): void {
  categories = initialCategories.map((category) => ({ ...category }));
}

resetCategoriesMock();

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

function problem(status: number, title: string, detail: string): ApiError {
  const body: ProblemDetail = { type: 'about:blank', title, status, detail };
  return new ApiError(status, body);
}

function assertValidPayload(payload: CategoryPayload): void {
  const errors = validateCategory(payload);
  if (errors.name) {
    throw problem(400, 'Bad Request', errors.name);
  }
}

function findCategory(categoryId: string): CategoryDTO {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    throw problem(404, 'Not Found', 'Categoria não encontrada.');
  }
  return category;
}

export async function getCategoriesMock(): Promise<CategoryDTO[]> {
  await wait();
  return categories.map((category) => ({ ...category }));
}

export async function createCategoryMock(payload: CategoryPayload): Promise<CategoryDTO> {
  await wait();
  assertValidPayload(payload);

  const now = new Date().toISOString();
  const created: CategoryDTO = {
    id: crypto.randomUUID(),
    name: payload.name,
    description: payload.description,
    draftCount: 0,
    publishedCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  categories = [...categories, created];
  return { ...created };
}

export async function updateCategoryMock(
  categoryId: string,
  payload: CategoryPayload,
): Promise<CategoryDTO> {
  await wait();
  const current = findCategory(categoryId);
  assertValidPayload(payload);

  const updated: CategoryDTO = {
    ...current,
    name: payload.name,
    description: payload.description,
    updatedAt: new Date().toISOString(),
  };
  categories = categories.map((item) => (item.id === categoryId ? updated : item));
  return { ...updated };
}

export async function deleteCategoryMock(categoryId: string): Promise<void> {
  await wait();
  const current = findCategory(categoryId);
  if (current.draftCount + current.publishedCount > 0) {
    throw problem(
      409,
      'Conflict',
      'A categoria possui perguntas e não pode ser removida. Remova as perguntas antes.',
    );
  }
  categories = categories.filter((item) => item.id !== categoryId);
}
