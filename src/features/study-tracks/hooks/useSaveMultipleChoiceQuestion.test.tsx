import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQuestion } from '../api/createQuestion';
import type { MultipleChoiceFormValues, QuestionDTO } from '../types';
import { categoryQueryKeys } from './categoryQueryKeys';
import { questionQueryKeys } from './questionQueryKeys';
import { useSaveMultipleChoiceQuestion } from './useSaveMultipleChoiceQuestion';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));

const values: MultipleChoiceFormValues = {
  statement: 'Onde guardar a reserva?',
  options: [
    { text: 'Tesouro Selic', correct: true },
    { text: 'Ações', correct: false },
  ],
  explanation: 'Explicação',
};

function questionDTO(id: string): QuestionDTO {
  return {
    id,
    status: 'DRAFT',
    draft: { type: 'MULTIPLE_CHOICE', ...values },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  };
}

function renderSave(queryClient: QueryClient) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSaveMultipleChoiceQuestion({ categoryId: 'cat-1' }), { wrapper });
}

async function create(save: ReturnType<typeof useSaveMultipleChoiceQuestion>['save']) {
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

describe('useSaveMultipleChoiceQuestion', () => {
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

  it('sem lista em cache, nao cria uma lista parcial', async () => {
    vi.mocked(createQuestion).mockResolvedValue(questionDTO('nova'));
    const queryClient = new QueryClient();
    const { result } = renderSave(queryClient);

    await create(result.current.save);

    expect(queryClient.getQueryData(listKey)).toBeUndefined();
  });
});

