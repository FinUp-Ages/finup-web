import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/features/auth/session/authContext';
import { AppRouter } from './index';

// Arvore de rotas real do painel, com a sessao ja autenticada e as features em modo mock.
vi.mock('react-router-dom', async (importOriginal) =>
  (await import('@/test/memoryRouterProvider')).withMemoryRouter(await importOriginal()),
);
vi.mock('@/shared/config/env', () => ({
  env: {
    useMocks: true,
    dashboardWidgetsApi: false,
    apiBaseUrl: 'http://localhost:8080',
    cognito: { region: '', clientId: '' },
  },
}));

const signOut = vi.fn().mockResolvedValue(undefined);
const session: AuthContextValue = {
  state: {
    status: 'authenticated',
    admin: { id: 'u-1', name: 'Ana Souza', email: 'ana@finup.com' },
  },
  signIn: vi.fn(),
  signOut,
  dismissNotice: vi.fn(),
};

describe('AppRouter autenticado', () => {
  it('abre o painel em Custos e navega pela sidebar ate sair', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={session}>
          <AppRouter />
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
    const user = userEvent.setup();

    // "/" -> "/app" -> "/app/costs"
    expect(screen.getByTestId('location')).toHaveTextContent('/app/costs');
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(nav).toBeVisible();
    expect(screen.getByText('Ana Souza')).toBeVisible();
    expect(screen.getByText('Pessoa administradora')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Custos' })).toHaveClass('border-white');

    await user.click(screen.getByRole('link', { name: 'Seu time' }));
    expect(await screen.findByRole('heading', { name: 'Usuários' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Seu time' })).toHaveClass('border-white');

    await user.click(screen.getByRole('link', { name: 'Analytics' }));
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    expect(screen.getByText('Conteúdo desta seção em desenvolvimento.')).toBeVisible();

    await user.click(screen.getByRole('link', { name: 'Trilha de estudos' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/app/studies');

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
