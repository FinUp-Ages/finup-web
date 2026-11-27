import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/config/httpClient';
import { UsersPage } from './UsersPage';

const config = vi.hoisted(() => ({ useMocks: true }));
vi.mock('@/shared/config/env', () => ({ env: config }));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

afterEach(() => {
  vi.restoreAllMocks();
  config.useMocks = true;
});

describe('UsersPage', () => {
  it('lista a primeira pagina com iniciais, status e data de entrada', async () => {
    renderPage();
    expect(screen.getByText('Carregando usuários...')).toBeVisible();

    expect(await screen.findByRole('table')).toBeVisible();
    expect(rows()).toHaveLength(20);
    const primeira = within(rows()[0]);
    expect(primeira.getByText('CJ')).toBeInTheDocument();
    expect(primeira.getByText('Carlos José')).toBeVisible();
    expect(primeira.getByText('Ativo')).toBeVisible();
    expect(primeira.getByText('24 ago')).toBeVisible();
    expect(within(rows()[3]).getByText('Inativo')).toBeVisible();
    expect(screen.getByText('1-20 de 120 usuários')).toBeVisible();
    expect(screen.getByText('Página 1 de 6')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('navega entre as paginas', async () => {
    const user = renderPage();
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(await screen.findByText('21-40 de 120 usuários')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(await screen.findByText('1-20 de 120 usuários')).toBeVisible();
  });

  it('busca por nome e volta para a primeira pagina', async () => {
    const user = renderPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    await screen.findByText('21-40 de 120 usuários');

    await user.type(screen.getByLabelText('Buscar usuário'), 'Mariana');

    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(screen.getByText('1-1 de 1 usuários')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('filtra por status e mostra o vazio quando nada combina', async () => {
    const user = renderPage();
    await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'INACTIVE');
    await waitFor(() =>
      expect(rows().every((row) => within(row).queryByText('Inativo') !== null)).toBe(true),
    );

    await user.type(screen.getByLabelText('Buscar usuário'), 'carlos');
    expect(await screen.findByText('Nenhum usuário encontrado.')).toBeVisible();
  });

  it('mostra o erro e tenta de novo', async () => {
    config.useMocks = false;
    const get = vi
      .spyOn(httpClient, 'get')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({
        data: {
          content: [
            {
              id: '9',
              name: 'Bruno',
              email: 'bruno@email.com',
              createdAt: '2026-01-10T10:00:00Z',
              lastSeenAt: '2026-01-10T10:00:00Z',
              status: 'ACTIVE',
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        },
      });
    const user = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os usuários.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Bruno')).toBeVisible();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('volta para a ultima pagina que existe quando o total encolhe', async () => {
    config.useMocks = false;
    const page = (n: number, totalPages: number) => ({
      data: {
        content: [
          {
            id: `u-${n}`,
            name: `Pessoa ${n}`,
            email: `p${n}@email.com`,
            createdAt: '2026-01-10T10:00:00Z',
            lastSeenAt: '2026-01-10T10:00:00Z',
            status: 'ACTIVE',
          },
        ],
        page: n,
        size: 20,
        totalElements: totalPages * 20,
        totalPages,
      },
    });
    const get = vi
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce(page(0, 3))
      .mockResolvedValueOnce(page(1, 3))
      .mockResolvedValue(page(0, 1));
    const user = renderPage();
    await screen.findByText('Pessoa 0');

    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    await screen.findByText('Pessoa 1');
    // A proxima busca diz que so existe uma pagina: a tela volta para a pagina 1.
    await user.click(screen.getByRole('button', { name: 'Próxima' }));

    await waitFor(() => expect(screen.getByText('Página 1 de 1')).toBeVisible());
    expect(get).toHaveBeenLastCalledWith('/api/v1/admin/users', {
      params: { page: 0, size: 20, status: undefined, search: undefined },
    });
  });
});
