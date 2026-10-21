import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQuestion } from '../api/createQuestion';
import type { FillBlankFormValues, QuestionDTO } from '../types';
import { questionQueryKeys } from './questionQueryKeys';
import { useSaveFillBlankQuestion } from './useSaveFillBlankQuestion';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));

const values: FillBlankFormValues = {
  title: 'Título',
  statement: 'A ___',
  answers: ['b'],
  explanation: '',
};

function questionDTO(id: string): QuestionDTO {
  return {
    id,
    status: 'DRAFT',
    draft: { type: 'FILL_BLANK', ...values },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  };
}

function renderSave(queryClient: QueryClient) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSaveFillBlankQuestion({ categoryId: 'cat-1' }), { wrapper });
}

/** Cria a pergunta e espera o onSaved. */
async function create(save: ReturnType<typeof useSaveFillBlankQuestion>['save']) {
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

describe('useSaveFillBlankQuestion - cache da lista da categoria', () => {
  it('sem lista em cache, nao cria uma lista so com a pergunta nova', async () => {
    vi.mocked(createQuestion).mockResolvedValue(questionDTO('nova'));
    const queryClient = new QueryClient();
    const { result } = renderSave(queryClient);

    await create(result.current.save);

    expect(queryClient.getQueryData(listKey)).toBeUndefined();
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
