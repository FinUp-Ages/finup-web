import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQuestion } from '../api/createQuestion';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { updateQuestion } from '../api/updateQuestion';
import type { QuestionDTO } from '../types';
import { LearningQuestionPage } from './LearningQuestionPage';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));
vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));

const existingLearning: QuestionDTO = {
  id: 'conteudo-1',
  status: 'DRAFT',
  draft: {
    type: 'LEARNING',
    title: 'Reserva de Emergência',
    body: '# O que é\nUma reserva serve para imprevistos.',
  },
  published: null,
  updatedAt: '2026-10-20T12:00:00Z',
  publishedAt: null,
};

function renderPage(initialPath: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/app/studies/categories/:categoryId/questions/new/learning"
            element={
              <LearningQuestionPage
                backTo="/app/studies"
                backLabel="Categorias"
                editPathFor={(catId, qId) =>
                  `/app/studies/categories/${catId}/questions/${qId}/edit`
                }
              />
            }
          />
          <Route
            path="/app/studies/categories/:categoryId/questions/:questionId/edit"
            element={
              <LearningQuestionPage
                backTo="/app/studies"
                backLabel="Categorias"
                editPathFor={(catId, qId) =>
                  `/app/studies/categories/${catId}/questions/${qId}/edit`
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
  vi.mocked(createQuestion).mockReset();
  vi.mocked(updateQuestion).mockReset();
  vi.mocked(getCategoryQuestions).mockReset();
  vi.mocked(getCategoryQuestions).mockResolvedValue([]);
});

describe('LearningQuestionPage - criacao', () => {
  it('valida campos e foca o titulo se vazio', async () => {
    const user = userEvent.setup();
    renderPage('/app/studies/categories/cat-1/questions/new/learning');

    expect(screen.getByRole('heading', { name: 'Nova pergunta: Conteúdo educativo' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(screen.getByText('Informe o título do conteúdo.')).toBeVisible();
    expect(screen.getByText('Informe o corpo do conteúdo em markdown.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveFocus();
  });

  it('cria rascunho de conteudo explicativo via POST e redireciona para edicao', async () => {
    const user = userEvent.setup();
    vi.mocked(createQuestion).mockResolvedValue({
      ...existingLearning,
      id: 'conteudo-novo',
    });

    renderPage('/app/studies/categories/cat-1/questions/new/learning');

    await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Renda Fixa Básica');
    await user.type(
      screen.getByRole('textbox', { name: /Corpo do conteúdo/ }),
      'Conceitos sobre Tesouro Direto e CDB.',
    );

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(createQuestion).toHaveBeenCalledWith('cat-1', {
      type: 'LEARNING',
      title: 'Renda Fixa Básica',
      body: 'Conceitos sobre Tesouro Direto e CDB.',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Editar pergunta: Conteúdo educativo' })).toBeVisible();
    });
    expect(await screen.findByText('Pergunta criada como rascunho.')).toBeVisible();
  });
});

describe('LearningQuestionPage - edicao', () => {
  it('carrega o rascunho existente e salva alteracoes com PUT', async () => {
    const user = userEvent.setup();
    vi.mocked(getCategoryQuestions).mockResolvedValue([existingLearning]);
    vi.mocked(updateQuestion).mockResolvedValue({
      ...existingLearning,
      draft: {
        type: 'LEARNING',
        title: 'Reserva de Emergência Atualizada',
        body: 'Texto com novas dicas.',
      },
    });

    renderPage('/app/studies/categories/cat-1/questions/conteudo-1/edit');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Reserva de Emergência')).toBeVisible();
    });

    const titleInput = screen.getByRole('textbox', { name: 'Título' });
    await user.clear(titleInput);
    await user.type(titleInput, 'Reserva de Emergência Atualizada');

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(updateQuestion).toHaveBeenCalledWith('conteudo-1', {
      type: 'LEARNING',
      title: 'Reserva de Emergência Atualizada',
      body: '# O que é\nUma reserva serve para imprevistos.',
    });

    await waitFor(() => {
      expect(screen.getByText('Rascunho salvo.')).toBeVisible();
    });
  });

  it('exibe badge e mensagem informativa quando a pergunta esta publicada', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([
      {
        ...existingLearning,
        status: 'PUBLISHED',
        published: existingLearning.draft,
      },
    ]);

    renderPage('/app/studies/categories/cat-1/questions/conteudo-1/edit');

    await waitFor(() => {
      expect(screen.getByText('Publicada')).toBeVisible();
    });
    expect(
      screen.getByText(/Esta pergunta está publicada. As alterações ficam no rascunho/),
    ).toBeVisible();
  });
});
