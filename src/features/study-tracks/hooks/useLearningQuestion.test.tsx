import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import type { QuestionDTO } from '../types';
import { useLearningQuestion } from './useLearningQuestion';

vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockQuestions: QuestionDTO[] = [
  {
    id: 'learning-1',
    status: 'DRAFT',
    draft: {
      type: 'LEARNING',
      title: 'Reserva de Emergência',
      body: 'Texto explicativo.',
    },
    published: null,
    updatedAt: '2026-10-28T10:00:00Z',
    publishedAt: null,
  },
  {
    id: 'fill-blank-1',
    status: 'DRAFT',
    draft: {
      type: 'FILL_BLANK',
      title: 'Lacuna',
      statement: 'Texto ___',
      answers: ['a'],
      explanation: '',
    },
    published: null,
    updatedAt: '2026-10-28T10:00:00Z',
    publishedAt: null,
  },
];

beforeEach(() => {
  vi.mocked(getCategoryQuestions).mockReset();
});

describe('useLearningQuestion', () => {
  it('sem questionId nao busca a lista', () => {
    const { result } = renderHook(() => useLearningQuestion('cat-1', undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.question).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('carrega e converte a pergunta de tipo LEARNING', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);

    const { result } = renderHook(() => useLearningQuestion('cat-1', 'learning-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.question).not.toBeNull());

    expect(result.current.question).toEqual({
      id: 'learning-1',
      type: 'LEARNING',
      status: 'DRAFT',
      values: {
        title: 'Reserva de Emergência',
        body: 'Texto explicativo.',
      },
    });
  });

  it('retorna null se a pergunta for de outro tipo', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);

    const { result } = renderHook(() => useLearningQuestion('cat-1', 'fill-blank-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.question).toBeNull();
  });
});
