import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '@/features/auth/session/authContext';
import type { AuthState } from '@/features/auth/types';
import { AuthenticatedAdminLayout } from './AuthenticatedAdminLayout';
import { paths } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <p>login {from ?? 'sem origem'}</p>;
}

function renderAt(state: AuthState, path = '/app/studies?aba=1') {
  render(
    <AuthContext.Provider
      value={{ state, signIn: vi.fn(), signOut: vi.fn(), dismissNotice: vi.fn() }}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={paths.login} element={<LoginProbe />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <p>conteudo protegido</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('espera a sessao salva ser conferida', () => {
    renderAt({ status: 'loading' });
    expect(screen.getByRole('status')).toHaveTextContent('Conferindo sua sessão…');
  });

  it('manda ao login sem sessao, sem guardar a origem', () => {
    renderAt({ status: 'unauthenticated', notice: null });
    expect(screen.getByText('login sem origem')).toBeVisible();
  });

  it('guarda a pagina atual quando a sessao expirou', () => {
    renderAt({ status: 'unauthenticated', notice: 'session-expired' });
    expect(screen.getByText('login /app/studies?aba=1')).toBeVisible();
  });

  it('mostra o conteudo com sessao autenticada', () => {
    renderAt({ status: 'authenticated', admin: { id: '1', name: 'Ana', email: 'a@b.com' } });
    expect(screen.getByText('conteudo protegido')).toBeVisible();
  });
});

describe('AuthenticatedAdminLayout', () => {
  it('nao renderiza nada sem sessao autenticada', () => {
    const { container } = render(
      <AuthContext.Provider
        value={{
          state: { status: 'loading' },
          signIn: vi.fn(),
          signOut: vi.fn(),
          dismissNotice: vi.fn(),
        }}
      >
        <MemoryRouter>
          <AuthenticatedAdminLayout navigation={[]} />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
