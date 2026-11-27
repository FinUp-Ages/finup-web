import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('react-router-dom', async (importOriginal) =>
  (await import('@/test/memoryRouterProvider')).withMemoryRouter(await importOriginal()),
);
vi.mock('@/shared/config/env', () => ({
  env: { useMocks: true, apiBaseUrl: '', cognito: { region: '', clientId: '' } },
}));

describe('App', () => {
  it('sem sessao salva, qualquer rota do painel cai no login', async () => {
    sessionStorage.clear();
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Boas-vindas ao painel da FinUp!' }),
    ).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
