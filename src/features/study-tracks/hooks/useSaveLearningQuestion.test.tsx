import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQuestion } from '../api/createQuestion';
import type { LearningFormValues, QuestionDTO } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';
import { questionQueryKeys } from './questionQueryKeys';
import { useSaveLearningQuestion } from './useSaveLearningQuestion';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));

const values: LearningFormValues = {
  title: 'Guia de Reserva',
  body: 'Texto explicativo sobre reserva.',
};

function questionDTO(id: string): QuestionDTO {
  return {
    id,
    status: 'DRAFT',
    draft: { type: 'LEARNING', ...values },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  };
}

function renderSave(queryClient: QueryClient) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSaveLearningQuestion({ categoryId: 'cat-1' }), { wrapper });
}

/** Cria o conteúdo e espera o onSaved. */
async function create(save: ReturnType<typeof useSaveLearningQuestion>['save']) {
  await act(
    () =>
      new Promise<void>((resolve) => {
        save(values, () => resolve());
      }),
  );
}

const listKey = questionQueryKeys.categoryQuestions('cat-1');

beforeEach(() => {
  vi.mocked(createQuestion).mockReset();
});

describe('useSaveLearningQuestion', () => {
  it('invalida as contagens das categorias sem invalidar a lista de perguntas atualizada', async () => {
    vi.mocked(createQuestion).mockResolvedValue(questionDTO('nova'));
    const queryClient = new QueryClient();
    const categoriesKey = categoryQueryKeys.list();
    queryClient.setQueryData(categoriesKey, []);
    queryClient.setQueryData<QuestionDTO[]>(listKey, [questionDTO('existente')]);
    const { result } = renderSave(queryClient);

    await create(result.current.save);

    expect(queryClient.getQueryState(categoriesKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData<QuestionDTO[]>(listKey)).toHaveLength(2);
  });

  it('com lista em cache, acrescenta a pergunta nova', async () => {
    vi.mocked(createQuestion).mockResolvedValue(questionDTO('nova'));
    const queryClient = new QueryClient();
    queryClient.setQueryData<QuestionDTO[]>(listKey, [questionDTO('existente')]);
    const { result } = renderSave(queryClient);

    await create(result.current.save);

    expect(
      queryClient.getQueryData<QuestionDTO[]>(listKey)?.map((question) => question.id),
    ).toEqual(['existente', 'nova']);
  });
});
