import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQuestion } from '../api/createQuestion';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { publishQuestion } from '../api/publishQuestion';
import { updateQuestion } from '../api/updateQuestion';
import type { QuestionDTO } from '../types';
import { LearningQuestionPage } from './LearningQuestionPage';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));
vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));
vi.mock('../api/publishQuestion', () => ({ publishQuestion: vi.fn() }));
vi.mock('../api/unpublishQuestion', () => ({ unpublishQuestion: vi.fn() }));
vi.mock('../api/discardDraftQuestion', () => ({ discardDraftQuestion: vi.fn() }));

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
  vi.mocked(publishQuestion).mockReset();
});

describe('LearningQuestionPage - criacao', () => {
  it('valida campos e foca o titulo se vazio', async () => {
    const user = userEvent.setup();
    renderPage('/app/studies/categories/cat-1/questions/new/learning');

    expect(screen.getByRole('heading', { name: 'Nova pergunta: Conteúdo educativo' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

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

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

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

  it('bloqueia publicar com edicoes nao salvas e libera depois de salvar o rascunho', async () => {
    const user = userEvent.setup();
    vi.mocked(getCategoryQuestions).mockResolvedValue([existingLearning]);
    vi.mocked(updateQuestion).mockResolvedValue({
      ...existingLearning,
      draft: {
        type: 'LEARNING',
        title: 'Reserva atualizada',
        body: '# O que é\nUma reserva serve para imprevistos.',
      },
    });

    renderPage('/app/studies/categories/cat-1/questions/conteudo-1/edit');

    const title = await screen.findByDisplayValue('Reserva de Emergência');
    const publish = screen.getByRole('button', { name: 'Publicar' });
    expect(publish).toBeEnabled();

    await user.clear(title);
    await user.type(title, 'Reserva atualizada');

    expect(publish).toBeDisabled();
    expect(publish).toHaveAccessibleDescription(
      'Salve o rascunho antes de publicar, voltar para rascunho ou descartar.',
    );

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(await screen.findByText('Rascunho salvo.')).toBeVisible();
    expect(publish).toBeEnabled();
  });

  it('publica o conteudo com confirmacao e atualiza o selo de status', async () => {
    const user = userEvent.setup();
    let current: QuestionDTO = existingLearning;
    vi.mocked(getCategoryQuestions).mockImplementation(async () => [current]);
    vi.mocked(publishQuestion).mockImplementation(async (id) => {
      current = {
        ...current,
        id,
        status: 'PUBLISHED',
        published: current.draft,
        publishedAt: '2026-10-23T12:00:00Z',
      };
      return current;
    });

    renderPage('/app/studies/categories/cat-1/questions/conteudo-1/edit');
    await screen.findByDisplayValue('Reserva de Emergência');
    expect(screen.getByText('Rascunho')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    const dialog = screen.getByRole('dialog');
    const confirm = screen
      .getAllByRole('button', { name: 'Publicar' })
      .find((button) => dialog.contains(button));
    await user.click(confirm!);

    expect(publishQuestion).toHaveBeenCalledWith('conteudo-1');
    expect(await screen.findByText('Pergunta publicada.')).toBeVisible();
    expect(screen.getByText('Publicada')).toBeVisible();
  });
});
