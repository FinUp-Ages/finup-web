import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { createQuestion } from '../api/createQuestion';
import { getCategoriesMock, resetCategoriesMock } from '../api/categoriesMock';
import { getCategories } from '../api/getCategories';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { updateQuestion } from '../api/updateQuestion';
import {
  createQuestionMock,
  getCategoryQuestionsMock,
  resetQuestionsMock,
} from '../api/questionsMock';
import { questionQueryKeys } from '../hooks/questionQueryKeys';
import type { CategoryDTO, FillBlankQuestionPayload, QuestionDTO, QuestionType } from '../types';
import { CategoryQuestionsPage } from './CategoryQuestionsPage';
import { FillBlankQuestionPage } from './FillBlankQuestionPage';
import { QuestionFormPendingPage } from './QuestionFormPendingPage';
import { StudyCategoriesPage } from './StudyCategoriesPage';

vi.mock('../api/getCategories', () => ({ getCategories: vi.fn() }));
vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));
vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));

const content: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Rendimento do CDB',
  statement: 'O CDB rende ___ do CDI',
  answers: ['100%'],
  explanation: '',
};

const questions: QuestionDTO[] = [
  {
    id: 'q-1',
    status: 'DRAFT',
    draft: content,
    published: null,
    updatedAt: '2026-10-21T12:00:00Z',
    publishedAt: null,
  },
  {
    id: 'q-2',
    status: 'PUBLISHED',
    draft: { type: 'MULTIPLE_CHOICE', statement: 'Onde guardar a reserva?' },
    published: { type: 'MULTIPLE_CHOICE', statement: 'Onde guardar a reserva?' },
    updatedAt: '2026-10-21T12:00:00Z',
    publishedAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'q-3',
    status: 'PUBLISHED_WITH_CHANGES',
    draft: { type: 'LEARNING', title: 'Reserva atualizada' },
    published: { type: 'LEARNING', title: 'Título publicado anterior' },
    updatedAt: '2026-10-21T12:00:00Z',
    publishedAt: '2026-10-20T12:00:00Z',
  },
];

const categories: CategoryDTO[] = [
  {
    id: 'cat-1',
    name: 'Reserva de emergência',
    description: '',
    draftCount: 2,
    publishedCount: 2,
    createdAt: '2026-10-20T12:00:00Z',
    updatedAt: '2026-10-21T12:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Orçamento',
    description: '',
    draftCount: 0,
    publishedCount: 0,
    createdAt: '2026-10-20T12:00:00Z',
    updatedAt: '2026-10-21T12:00:00Z',
  },
];

const listPath = (categoryId: string) => `/studies/categories/${categoryId}/questions`;
const createPath = (categoryId: string, type: QuestionType) =>
  `${listPath(categoryId)}/new/${type}`;
const editPath = (categoryId: string, id: string) => `${listPath(categoryId)}/${id}/edit`;

function renderAt(url = listPath('cat-1')) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const form = (
    <FillBlankQuestionPage
      backTo={listPath}
      backLabel="Perguntas da categoria"
      editPathFor={editPath}
    />
  );
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/studies" element={<StudyCategoriesPage questionsPathFor={listPath} />} />
          <Route
            path="/studies/categories/:categoryId/questions"
            element={
              <CategoryQuestionsPage
                backTo="/studies"
                createPathFor={createPath}
                editPathFor={editPath}
              />
            }
          />
          <Route path="/studies/categories/:categoryId/questions/new/FILL_BLANK" element={form} />
          <Route path="/studies/categories/:categoryId/questions/:questionId/edit" element={form} />
          <Route
            path="/studies/categories/:categoryId/questions/new/MULTIPLE_CHOICE"
            element={<QuestionFormPendingPage type="MULTIPLE_CHOICE" backPathFor={listPath} />}
          />
          <Route
            path="/studies/categories/:categoryId/questions/new/LEARNING"
            element={<QuestionFormPendingPage type="LEARNING" backPathFor={listPath} />}
          />
        </Routes>
        <Link to={listPath('cat-2')}>Outra categoria</Link>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), queryClient };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCategories).mockResolvedValue(categories);
  vi.mocked(getCategoryQuestions).mockResolvedValue(questions);
});

describe('CategoryQuestionsPage', () => {
  it('atualiza a contagem ao criar uma pergunta e voltar para as categorias com os mocks integrados', async () => {
    resetCategoriesMock();
    resetQuestionsMock();
    vi.mocked(getCategories).mockImplementation(getCategoriesMock);
    vi.mocked(getCategoryQuestions).mockImplementation(getCategoryQuestionsMock);
    vi.mocked(createQuestion).mockImplementation(createQuestionMock);
    const { user } = renderAt('/studies');
    const manage = await screen.findByRole('link', {
      name: 'Gerenciar perguntas de Investimentos',
    });
    const initialRow = within(manage.closest('tr')!);
    expect(initialRow.getAllByRole('cell')[1]).toHaveTextContent('0');
    expect(initialRow.getAllByRole('cell')[2]).toHaveTextContent('0');

    await user.click(manage);
    await screen.findByText('Nenhuma pergunta cadastrada nesta categoria.');
    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }));
    await user.type(screen.getByLabelText('Título'), 'Rendimento do investimento');
    await user.type(screen.getByLabelText('Enunciado'), content.statement);
    await user.type(screen.getByLabelText('Respostas aceitas'), '100%{Enter}');
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    await screen.findByText('Pergunta criada como rascunho.');
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(await screen.findByText('Rendimento do investimento')).toBeVisible();
    await user.click(screen.getByRole('link', { name: /Categorias da trilha/ }));

    await waitFor(() => {
      const row = within(
        screen.getByRole('link', { name: 'Gerenciar perguntas de Investimentos' }).closest('tr')!,
      );
      expect(row.getAllByRole('cell')[1]).toHaveTextContent('1');
      expect(row.getAllByRole('cell')[2]).toHaveTextContent('0');
    });
  });

  it('permite abrir a criacao pelo teclado com controles rotulados', async () => {
    const { user } = renderAt();
    await screen.findByRole('table');

    await user.tab();
    expect(screen.getByRole('link', { name: /Categorias da trilha/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Tipo de pergunta' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Nova pergunta' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { name: 'Nova pergunta: Preencher lacuna' })).toBeVisible();
  });

  it.each([
    ['Onde guardar a reserva?', 'Múltipla escolha'],
    ['Reserva atualizada', 'Conteúdo educativo'],
  ])('mantem o tipo correto ao abrir a edicao de %s', async (title, label) => {
    const { user } = renderAt();
    await user.click(await screen.findByRole('link', { name: `Editar pergunta ${title}` }));

    expect(await screen.findByRole('heading', { name: `Editar pergunta: ${label}` })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('ainda não pode ser editado no painel');
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(await screen.findByRole('table')).toBeVisible();
  });

  it('mostra carregamento ate a consulta da categoria terminar', async () => {
    let resolve!: (value: QuestionDTO[]) => void;
    vi.mocked(getCategoryQuestions).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    renderAt();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando perguntas…');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await act(async () => {
      resolve(questions);
    });
    expect(await screen.findByRole('table')).toBeVisible();
  });

  it('lista os tres tipos, os tres selos e os titulos do draft', async () => {
    renderAt();
    const table = await screen.findByRole('table', { name: 'Perguntas da categoria' });

    expect(await screen.findByText('Reserva de emergência')).toBeVisible();
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    for (const text of [
      'Rendimento do CDB',
      'Onde guardar a reserva?',
      'Reserva atualizada',
      'Preencher lacuna',
      'Múltipla escolha',
      'Conteúdo educativo',
      'Rascunho',
      'Publicada',
      'Publicada com alterações',
    ]) {
      expect(within(table).getByText(text)).toBeVisible();
    }
    expect(screen.queryByText('Título publicado anterior')).not.toBeInTheDocument();
    expect(getCategoryQuestions).toHaveBeenCalledWith('cat-1');
    expect(screen.getByRole('link', { name: 'Editar pergunta Rendimento do CDB' })).toHaveAttribute(
      'href',
      editPath('cat-1', 'q-1'),
    );
  });

  it('permite criar a primeira pergunta quando a categoria esta vazia', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([]);
    const { user } = renderAt();

    expect(await screen.findByText('Nenhuma pergunta cadastrada nesta categoria.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }));
    expect(screen.getByRole('heading', { name: 'Nova pergunta: Preencher lacuna' })).toBeVisible();
    expect(screen.getByLabelText('Título')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(await screen.findByText('Nenhuma pergunta cadastrada nesta categoria.')).toBeVisible();
  });

  it.each([
    [new ApiError(404, null), 'Categoria não encontrada.'],
    [new ApiError(403, null), 'Você não tem permissão para acessar as perguntas desta categoria.'],
    [
      new ApiError(null, null),
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    ],
    [new ApiError(500, null), 'Não foi possível carregar as perguntas. Tente novamente.'],
  ])('trata a falha inicial sem mostrar um falso estado vazio (%s)', async (error, message) => {
    vi.mocked(getCategoryQuestions).mockRejectedValue(error);
    renderAt();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(
      screen.queryByText('Nenhuma pergunta cadastrada nesta categoria.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova pergunta' })).not.toBeInTheDocument();
  });

  it('recupera a lista quando a pessoa tenta novamente', async () => {
    vi.mocked(getCategoryQuestions)
      .mockRejectedValueOnce(new ApiError(500, null))
      .mockResolvedValue(questions);
    const { user } = renderAt();
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('table')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getCategoryQuestions).toHaveBeenCalledTimes(2);
  });

  it('preserva a lista em falha de atualizacao e permite uma nova tentativa', async () => {
    const { user, queryClient } = renderAt();
    await screen.findByRole('table');
    vi.mocked(getCategoryQuestions).mockRejectedValueOnce(new ApiError(500, null));

    await act(() =>
      queryClient.invalidateQueries({ queryKey: questionQueryKeys.categoryQuestions('cat-1') }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar a lista.',
    );
    expect(screen.getByRole('table')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByRole('table');
    expect(await screen.findByText('Rendimento do CDB')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('nao mostra perguntas da categoria anterior ao navegar para outra', async () => {
    let resolve!: (value: QuestionDTO[]) => void;
    vi.mocked(getCategoryQuestions).mockImplementation(async (categoryId) => {
      if (categoryId === 'cat-1') return questions;
      return new Promise((done) => {
        resolve = done;
      });
    });
    const { user } = renderAt();
    await screen.findByRole('table');

    await user.click(screen.getByRole('link', { name: 'Outra categoria' }));

    expect(screen.getByRole('status')).toHaveTextContent('Carregando perguntas…');
    expect(screen.queryByText('Rendimento do CDB')).not.toBeInTheDocument();
    await act(async () => {
      resolve([]);
    });
    expect(await screen.findByText('Nenhuma pergunta cadastrada nesta categoria.')).toBeVisible();
    expect(getCategoryQuestions).toHaveBeenLastCalledWith('cat-2');
  });

  it.each([
    ['MULTIPLE_CHOICE', 'Múltipla escolha'],
    ['LEARNING', 'Conteúdo educativo'],
  ])('prepara a criacao %s sem redirecionar para o formulario de lacuna', async (type, label) => {
    const { user } = renderAt();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de pergunta' }), type);
    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }));

    expect(screen.getByRole('heading', { name: `Nova pergunta: ${label}` })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'O formulário deste tipo ainda não está disponível.',
    );
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
    expect(createQuestion).not.toHaveBeenCalled();
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(await screen.findByRole('table')).toBeVisible();
  });

  it('abre a lista pelo nome da categoria e volta para as categorias', async () => {
    const { user } = renderAt('/studies');
    await user.click(
      await screen.findByRole('link', { name: 'Ver perguntas de Reserva de emergência' }),
    );
    expect(await screen.findByRole('table', { name: 'Perguntas da categoria' })).toBeVisible();

    await user.click(screen.getByRole('link', { name: /Categorias da trilha/ }));

    expect(
      await screen.findByRole('table', { name: 'Categorias da trilha de estudos' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Editar categoria Reserva de emergência' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Remover categoria Reserva de emergência' }),
    ).toBeVisible();
  });

  it('abre a mesma lista pela acao Gerenciar perguntas, preservando o link no nome', async () => {
    const { user } = renderAt('/studies');
    const manage = await screen.findByRole('link', {
      name: 'Gerenciar perguntas de Reserva de emergência',
    });
    const title = screen.getByRole('link', { name: 'Ver perguntas de Reserva de emergência' });
    expect(manage).toHaveAttribute('href', title.getAttribute('href'));

    await user.click(manage);

    expect(await screen.findByRole('table', { name: 'Perguntas da categoria' })).toBeVisible();
    expect(getCategoryQuestions).toHaveBeenCalledWith('cat-1');
  });

  it('reflete a pergunta criada ao retornar do formulario, sem perder as demais', async () => {
    const created = { ...questions[0], id: 'nova', draft: { ...content, title: 'Nova reserva' } };
    vi.mocked(createQuestion).mockResolvedValue(created);
    const { user } = renderAt();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }));
    await user.type(screen.getByLabelText('Título'), 'Nova reserva');
    await user.type(screen.getByLabelText('Enunciado'), content.statement);
    await user.type(screen.getByLabelText('Respostas aceitas'), '100%{Enter}');
    vi.mocked(getCategoryQuestions).mockResolvedValue([...questions, created]);

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    await screen.findByText('Pergunta criada como rascunho.');
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Nova reserva')).toBeVisible();
    expect(within(table).getByText('Rendimento do CDB')).toBeVisible();
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(createQuestion).toHaveBeenCalledWith(
      'cat-1',
      expect.objectContaining({ type: 'FILL_BLANK', title: 'Nova reserva' }),
    );
  });

  it('atualiza titulo e selo apos editar o rascunho de uma pergunta publicada', async () => {
    const published = {
      ...questions[0],
      status: 'PUBLISHED' as const,
      published: content,
      publishedAt: '2026-10-20T12:00:00Z',
    };
    const updated = {
      ...published,
      status: 'PUBLISHED_WITH_CHANGES' as const,
      draft: { ...content, title: 'CDB atualizado' },
    };
    vi.mocked(getCategoryQuestions).mockResolvedValue([published]);
    vi.mocked(updateQuestion).mockResolvedValue(updated);
    const { user } = renderAt();
    await user.click(
      await screen.findByRole('link', { name: 'Editar pergunta Rendimento do CDB' }),
    );
    const input = await screen.findByLabelText('Título');
    await user.clear(input);
    await user.type(input, 'CDB atualizado');
    vi.mocked(getCategoryQuestions).mockResolvedValue([updated]);

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));
    await screen.findByText(
      'Rascunho salvo. A versão publicada só muda quando for publicada de novo.',
    );
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));

    const table = await screen.findByRole('table');
    expect(within(table).getByText('CDB atualizado')).toBeVisible();
    expect(within(table).getByText('Publicada com alterações')).toBeVisible();
    expect(within(table).queryByText('Rendimento do CDB')).not.toBeInTheDocument();
  });
});
