import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { createCategory } from '../api/createCategory';
import { deleteCategory } from '../api/deleteCategory';
import { getCategories } from '../api/getCategories';
import { updateCategory } from '../api/updateCategory';
import type { CategoryDTO } from '../types';
import { StudyCategoriesPage } from './StudyCategoriesPage';

vi.mock('../api/getCategories', () => ({ getCategories: vi.fn() }));
vi.mock('../api/createCategory', () => ({ createCategory: vi.fn() }));
vi.mock('../api/updateCategory', () => ({ updateCategory: vi.fn() }));
vi.mock('../api/deleteCategory', () => ({ deleteCategory: vi.fn() }));

function category(id: string, name: string, draftCount = 0, publishedCount = 0): CategoryDTO {
  return {
    id,
    name,
    description: `Sobre ${name}`,
    draftCount,
    publishedCount,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-10-10T15:30:00Z',
  };
}

const reserva = category('categoria-reserva', 'Reserva de emergência', 1, 2);
const investimentos = category('categoria-investimentos', 'Investimentos');

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <StudyCategoriesPage questionsPathFor={(id) => `/app/studies/categories/${id}/questions`} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

const dialog = () => screen.getByRole('dialog');

beforeEach(() => {
  vi.mocked(getCategories).mockReset().mockResolvedValue([reserva, investimentos]);
  vi.mocked(createCategory).mockReset();
  vi.mocked(updateCategory).mockReset();
  vi.mocked(deleteCategory).mockReset();
});

describe('StudyCategoriesPage', () => {
  it('lista as categorias com as acoes de cada uma', async () => {
    renderPage();
    expect(screen.getByText('Carregando categorias…')).toBeVisible();

    const table = await screen.findByRole('table', { name: 'Categorias da trilha de estudos' });
    expect(within(table).getByText('Reserva de emergência')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Gerenciar perguntas de Investimentos' }),
    ).toHaveAttribute('href', '/app/studies/categories/categoria-investimentos/questions');
  });

  it('mostra o vazio quando nao ha categorias', async () => {
    vi.mocked(getCategories).mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Nenhuma categoria cadastrada.')).toBeVisible();
  });

  it('mostra o erro de carregamento e tenta de novo', async () => {
    vi.mocked(getCategories)
      .mockRejectedValueOnce(new ApiError(403, null))
      .mockResolvedValue([investimentos]);
    const user = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para ver as categorias.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Investimentos')).toBeVisible();
  });

  it('valida o nome e cria a categoria sem espacos nas pontas', async () => {
    vi.mocked(createCategory).mockResolvedValue(category('nova', 'Cartão de crédito'));
    const user = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
    expect(within(dialog()).getByRole('heading', { name: 'Nova categoria' })).toBeVisible();
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar' }));
    expect(within(dialog()).getByText('Informe o nome da categoria.')).toBeVisible();
    expect(within(dialog()).getByLabelText(/Nome/)).toHaveFocus();

    await user.type(within(dialog()).getByLabelText(/Nome/), '  Cartão de crédito ');
    expect(within(dialog()).queryByText('Informe o nome da categoria.')).not.toBeInTheDocument();
    await user.type(within(dialog()).getByLabelText(/Descrição/), ' Juros e fatura ');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Categoria “Cartão de crédito” criada.')).toBeVisible();
    expect(createCategory).toHaveBeenCalledWith({
      name: 'Cartão de crédito',
      description: 'Juros e fatura',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getCategories).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Fechar mensagem' }));
    expect(screen.queryByText('Categoria “Cartão de crédito” criada.')).not.toBeInTheDocument();
  });

  it('edita a categoria e mostra o erro de regra sem fechar o modal', async () => {
    vi.mocked(updateCategory)
      .mockRejectedValueOnce(
        new ApiError(409, { status: 409, detail: 'Já existe uma categoria com esse nome.' }),
      )
      .mockResolvedValue({ ...investimentos, name: 'Investir melhor' });
    const user = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Editar categoria Investimentos' }));
    const nome = within(dialog()).getByLabelText(/Nome/);
    expect(nome).toHaveValue('Investimentos');
    await user.clear(nome);
    await user.type(nome, 'Investir melhor');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar' }));

    expect(await within(dialog()).findByRole('alert')).toHaveTextContent(
      'Já existe uma categoria com esse nome.',
    );
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Categoria “Investir melhor” atualizada.')).toBeVisible();
    expect(updateCategory).toHaveBeenLastCalledWith('categoria-investimentos', {
      name: 'Investir melhor',
      description: 'Sobre Investimentos',
    });
  });

  it('nao fecha o modal de edicao enquanto salva', async () => {
    let finish: (value: CategoryDTO) => void = () => undefined;
    vi.mocked(createCategory).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const user = renderPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await user.type(within(dialog()).getByLabelText(/Nome/), 'Metas');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar' }));

    expect(await within(dialog()).findByRole('button', { name: 'Salvando…' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    finish(category('metas', 'Metas'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('cancela a criacao pelo botao', async () => {
    const user = renderPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Nova categoria' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('mostra o 409 de categoria com perguntas sem fechar a confirmacao', async () => {
    vi.mocked(deleteCategory).mockRejectedValue(new ApiError(409, { status: 409 }));
    const user = renderPage();
    await screen.findByRole('table');

    await user.click(
      screen.getByRole('button', { name: 'Remover categoria Reserva de emergência' }),
    );
    expect(within(dialog()).getByText('“Reserva de emergência”')).toBeVisible();
    expect(within(dialog()).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.click(within(dialog()).getByRole('button', { name: 'Remover' }));

    expect(await within(dialog()).findByRole('alert')).toHaveTextContent(
      'A categoria possui perguntas e não pode ser removida. Remova as perguntas antes.',
    );
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('remove a categoria e leva o foco ao titulo da tela', async () => {
    vi.mocked(deleteCategory).mockResolvedValue(undefined);
    vi.mocked(getCategories)
      .mockResolvedValueOnce([reserva, investimentos])
      .mockResolvedValue([reserva]);
    const user = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Remover categoria Investimentos' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Remover' }));

    expect(await screen.findByText('Categoria “Investimentos” removida.')).toBeVisible();
    expect(deleteCategory).toHaveBeenCalledWith('categoria-investimentos', expect.anything());
    expect(screen.getByRole('heading', { name: 'Trilha de estudos' })).toHaveFocus();
    await waitFor(() => expect(screen.queryByText('Investimentos')).not.toBeInTheDocument());
  });

  it('nao fecha a confirmacao enquanto remove', async () => {
    vi.mocked(deleteCategory).mockReturnValue(new Promise(() => undefined));
    const user = renderPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Remover categoria Investimentos' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Remover' }));

    expect(await within(dialog()).findByRole('button', { name: 'Removendo…' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
