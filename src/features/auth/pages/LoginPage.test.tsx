import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { authenticated, sessionValue, withSession } from '@/test/session';
import type { AuthState } from '../types';
import { LoginPage } from './LoginPage';

function renderLoginPage(state: AuthState, routerState?: { from: string }) {
  render(
    withSession(
      sessionValue(state),
      <MemoryRouter initialEntries={[{ pathname: '/login', state: routerState }]}>
        <Routes>
          <Route path="/login" element={<LoginPage redirectTo="/app" />} />
          <Route path="/app" element={<p>painel</p>} />
          <Route path="/app/studies" element={<p>trilha</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
}

describe('LoginPage', () => {
  it('mostra a espera enquanto confere a sessao salva', () => {
    renderLoginPage({ status: 'loading' });
    expect(screen.getByRole('status')).toHaveTextContent('Conferindo sua sessão…');
  });

  it('mostra o formulario, o cabecalho e o rodape de primeiro acesso', () => {
    renderLoginPage({ status: 'unauthenticated', notice: null });

    expect(screen.getByRole('heading', { name: 'Boas-vindas ao painel da FinUp!' })).toBeVisible();
    expect(screen.getByAltText('Logo da FinUp')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Primeiro acesso?' })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Dê um up/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Baixe o app' })).toBeVisible();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('explica por que a sessao terminou', () => {
    renderLoginPage({ status: 'unauthenticated', notice: 'access-denied' });
    expect(screen.getByRole('alert')).toHaveTextContent('Acesso negado.');
  });

  it('leva ao painel quando ja ha sessao', () => {
    renderLoginPage(authenticated);
    expect(screen.getByText('painel')).toBeVisible();
  });

  it('volta para a pagina em que a sessao expirou', () => {
    renderLoginPage(authenticated, { from: '/app/studies' });
    expect(screen.getByText('trilha')).toBeVisible();
  });
});
