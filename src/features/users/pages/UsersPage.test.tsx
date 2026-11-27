import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUsers } from '../api/getUsers';
import type { UserDTO, UsersResponse } from '../types';
import { UsersPage } from './UsersPage';

// Por padrao a page usa a lista simulada de getUsers (VITE_USE_MOCKS); os casos de erro e de
// total que encolhe trocam a resposta da api/, como nos testes das outras pages.
vi.mock('@/shared/config/env', async () => (await import('@/test/env')).mockEnv());
vi.mock('../api/getUsers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/getUsers')>();
  return { getUsers: vi.fn(actual.getUsers) };
});

const realGetUsers = vi.mocked(getUsers).getMockImplementation()!;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

function user(id: string, name: string): UserDTO {
  return {
    id,
    name,
    email: `${id}@email.com`,
    createdAt: '2026-01-10T10:00:00Z',
    lastSeenAt: '2026-01-10T10:00:00Z',
    status: 'ACTIVE',
  };
}

function pageOf(users: UserDTO[], page: number, totalPages: number): UsersResponse {
  return { content: users, page, size: 20, totalElements: totalPages * 20, totalPages };
}

const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const rowOf = (name: string) => within(screen.getByText(name).closest('tr')!);

beforeEach(() => {
  vi.mocked(getUsers).mockReset().mockImplementation(realGetUsers);
});

describe('UsersPage', () => {
  it('lista a primeira pagina com iniciais, status e data de entrada', async () => {
    renderPage();
    expect(screen.getByText('Carregando usuários...')).toBeVisible();

    expect(await screen.findByRole('table')).toBeVisible();
    expect(rows()).toHaveLength(20);
    expect(rowOf('Carlos José').getByText('CJ')).toBeInTheDocument();
    expect(rowOf('Carlos José').getByText('Ativo')).toBeVisible();
    // createdAt 2026-08-24 no mock, no formato "dia mes" sem o "de".
    expect(rowOf('Carlos José').getByText('24 ago')).toBeVisible();
    expect(rowOf('Mariana Costa').getByText('Inativo')).toBeVisible();
    expect(screen.getByText('1-20 de 120 usuários')).toBeVisible();
    expect(screen.getByText('Página 1 de 6')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('navega entre as paginas', async () => {
    const userEv = renderPage();
    await screen.findByRole('table');

    await userEv.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(await screen.findByText('21-40 de 120 usuários')).toBeVisible();

    await userEv.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(await screen.findByText('1-20 de 120 usuários')).toBeVisible();
  });

  it('busca por nome e volta para a primeira pagina', async () => {
    const userEv = renderPage();
    await screen.findByRole('table');
    await userEv.click(screen.getByRole('button', { name: 'Próxima' }));
    await screen.findByText('21-40 de 120 usuários');

    await userEv.type(screen.getByLabelText('Buscar usuário'), 'Mariana');

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.getByText('1-1 de 1 usuários')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('filtra por status e mostra o vazio quando nada combina', async () => {
    const userEv = renderPage();
    await screen.findByRole('table');

    await userEv.selectOptions(screen.getByLabelText('Filtrar por status'), 'INACTIVE');
    await waitFor(() =>
      expect(rows().every((row) => within(row).queryByText('Inativo') !== null)).toBe(true),
    );

    await userEv.type(screen.getByLabelText('Buscar usuário'), 'carlos');
    expect(await screen.findByText('Nenhum usuário encontrado.')).toBeVisible();
  });

  it('mostra o erro e tenta de novo', async () => {
    vi.mocked(getUsers)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(pageOf([user('9', 'Bruno')], 0, 1));
    const userEv = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os usuários.',
    );
    await userEv.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Bruno')).toBeVisible();
    expect(getUsers).toHaveBeenCalledTimes(2);
  });

  it('volta para a ultima pagina que existe quando o total encolhe', async () => {
    vi.mocked(getUsers)
      .mockResolvedValueOnce(pageOf([user('u-0', 'Pessoa 0')], 0, 3))
      .mockResolvedValueOnce(pageOf([user('u-1', 'Pessoa 1')], 1, 3))
      .mockResolvedValue(pageOf([user('u-0', 'Pessoa 0')], 0, 1));
    const userEv = renderPage();
    await screen.findByText('Pessoa 0');

    await userEv.click(screen.getByRole('button', { name: 'Próxima' }));
    await screen.findByText('Pessoa 1');
    // A proxima busca diz que so existe uma pagina: a tela volta para a pagina 1.
    await userEv.click(screen.getByRole('button', { name: 'Próxima' }));

    await waitFor(() => expect(screen.getByText('Página 1 de 1')).toBeVisible());
    expect(getUsers).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      status: undefined,
      search: undefined,
    });
  });
});
