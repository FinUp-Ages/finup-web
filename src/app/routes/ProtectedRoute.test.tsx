import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { authenticated, sessionValue, withSession, type AuthState } from '@/test/session';
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
    withSession(
      sessionValue(state),
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
      </MemoryRouter>,
    ),
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
    renderAt(authenticated);
    expect(screen.getByText('conteudo protegido')).toBeVisible();
  });
});

describe('AuthenticatedAdminLayout', () => {
  it('nao renderiza nada sem sessao autenticada', () => {
    const { container } = render(
      withSession(
        sessionValue({ status: 'loading' }),
        <MemoryRouter>
          <AuthenticatedAdminLayout navigation={[]} />
        </MemoryRouter>,
      ),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
