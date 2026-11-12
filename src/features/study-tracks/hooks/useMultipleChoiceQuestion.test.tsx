import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import type { QuestionDTO } from '../types';
import { useMultipleChoiceQuestion } from './useMultipleChoiceQuestion';

vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockQuestions: QuestionDTO[] = [
  {
    id: 'mc-1',
    status: 'DRAFT',
    draft: {
      type: 'MULTIPLE_CHOICE',
      statement: 'Onde guardar a reserva?',
      options: [
        { text: 'Tesouro Selic', correct: true },
        { text: 'Renda variável', correct: false },
      ],
      explanation: 'Alta liquidez e baixo risco.',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
];

beforeEach(() => {
  vi.mocked(getCategoryQuestions).mockReset();
});

describe('useMultipleChoiceQuestion', () => {
  it('sem questionId nao busca a lista da categoria', () => {
    const { result } = renderHook(() => useMultipleChoiceQuestion('cat-1', undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.question).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('carrega e converte a pergunta do tipo MULTIPLE_CHOICE', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);

    const { result } = renderHook(() => useMultipleChoiceQuestion('cat-1', 'mc-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.question).not.toBeNull());

    expect(result.current.question).toEqual({
      id: 'mc-1',
      type: 'MULTIPLE_CHOICE',
      status: 'DRAFT',
      values: {
        statement: 'Onde guardar a reserva?',
        options: [
          { text: 'Tesouro Selic', correct: true },
          { text: 'Renda variável', correct: false },
        ],
        explanation: 'Alta liquidez e baixo risco.',
      },
    });
  });
});

