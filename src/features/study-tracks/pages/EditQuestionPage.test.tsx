import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import type { QuestionDTO } from '../types';
import { EditQuestionPage } from './EditQuestionPage';

vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));

const mockQuestions: QuestionDTO[] = [
  {
    id: 'q-multiple-choice',
    status: 'DRAFT',
    draft: {
      type: 'MULTIPLE_CHOICE',
      statement: 'Onde guardar a reserva?',
      options: [
        { text: 'Tesouro Selic', correct: true },
        { text: 'Ações', correct: false },
      ],
      explanation: 'Explicação',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
  {
    id: 'q-fill-blank',
    status: 'DRAFT',
    draft: {
      type: 'FILL_BLANK',
      title: 'Título Lacuna',
      statement: 'O CDB rende ___ do CDI',
      answers: ['100%'],
      explanation: '',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
  {
    id: 'q-learning',
    status: 'DRAFT',
    draft: {
      type: 'LEARNING',
      title: 'Título Educativo',
      body: 'Corpo educativo',
    },
    published: null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: null,
  },
];

function renderAt(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route
            path="/studies/categories/:categoryId/questions/:questionId/edit"
            element={
              <EditQuestionPage
                backTo="/studies"
                editPathFor={(categoryId, questionId) =>
                  `/studies/categories/${categoryId}/questions/${questionId}/edit`
                }
              />
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getCategoryQuestions).mockReset();
});

describe('EditQuestionPage', () => {
  it('mostra carregando enquanto busca as perguntas da categoria', () => {
    vi.mocked(getCategoryQuestions).mockReturnValue(new Promise(() => undefined));
    renderAt('/studies/categories/cat-1/questions/q-multiple-choice/edit');

    expect(screen.getByRole('status')).toHaveTextContent('Carregando pergunta...');
  });

  it('renderiza MultipleChoiceQuestionPage quando a pergunta é do tipo MULTIPLE_CHOICE', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);
    renderAt('/studies/categories/cat-1/questions/q-multiple-choice/edit');

    expect(
      await screen.findByRole('heading', { name: 'Editar pergunta: Múltipla escolha' }),
    ).toBeVisible();
    expect(screen.getByDisplayValue('Onde guardar a reserva?')).toBeVisible();
    expect(screen.getByDisplayValue('Tesouro Selic')).toBeVisible();
  });

  it('renderiza FillBlankQuestionPage quando a pergunta é do tipo FILL_BLANK', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);
    renderAt('/studies/categories/cat-1/questions/q-fill-blank/edit');

    expect(
      await screen.findByRole('heading', { name: 'Editar pergunta: Preencher lacuna' }),
    ).toBeVisible();
    expect(screen.getByDisplayValue('Título Lacuna')).toBeVisible();
    expect(screen.getByDisplayValue('O CDB rende ___ do CDI')).toBeVisible();
  });

  it('exibe mensagem quando o tipo ainda não tem formulário suportado', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);
    renderAt('/studies/categories/cat-1/questions/q-learning/edit');

    expect(
      await screen.findByRole('heading', { name: 'Editar pergunta: Conteúdo educativo' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Esta pergunta é do tipo Conteúdo educativo, que ainda não pode ser editado no painel.',
      ),
    ).toBeVisible();
  });

  it('exibe mensagem de erro quando a categoria não é encontrada', async () => {
    vi.mocked(getCategoryQuestions).mockRejectedValue(new ApiError(404, { status: 404 }));
    renderAt('/studies/categories/cat-1/questions/q-multiple-choice/edit');

    expect(await screen.findByRole('alert')).toHaveTextContent('Categoria não encontrada.');
  });

  it('exibe mensagem quando a pergunta não existe na categoria', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue(mockQuestions);
    renderAt('/studies/categories/cat-1/questions/q-inexistente/edit');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pergunta não encontrada nesta categoria.',
    );
  });
});

