import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { setHttpAuthHandlers, type HttpAuthHandlers } from '@/shared/config/httpClient';
import { CognitoError } from '../api/cognitoClient';
import { createCurrentUser } from '../api/createCurrentUser';
import { getAdminMe } from '../api/getAdminMe';
import { useAuth } from '../hooks/useAuth';
import { authSession } from '../session/authSession';
import { NETWORK_MESSAGE, VALIDATION_FAILED_MESSAGE } from '../session/messages';
import type { AdminMeDTO } from '../types';
import { AuthProvider } from './AuthProvider';

vi.mock('../api/getAdminMe', () => ({ getAdminMe: vi.fn() }));
vi.mock('../api/createCurrentUser', () => ({ createCurrentUser: vi.fn() }));
vi.mock('@/shared/config/httpClient', () => ({ setHttpAuthHandlers: vi.fn() }));
vi.mock('../session/authSession', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../session/authSession')>()),
  authSession: {
    hasSession: vi.fn(),
    signIn: vi.fn(),
    refresh: vi.fn(),
    getValidAccessToken: vi.fn(),
    clear: vi.fn(),
    signOut: vi.fn(),
  },
}));

const session = vi.mocked(authSession);
const adminMe = vi.mocked(getAdminMe);
const createUser = vi.mocked(createCurrentUser);

const ADMIN: AdminMeDTO = { id: 'u-1', name: 'Ana Souza', email: 'ana@finup.com', role: 'ADMIN' };

/** Mostra o estado da sessao e expoe as acoes do contexto como botoes. */
function Probe() {
  const { state, signIn, signOut, dismissNotice } = useAuth();
  const [loginError, setLoginError] = useState('');
  return (
    <>
      <p data-testid="status">{state.status}</p>
      {state.status === 'authenticated' && <p data-testid="admin">{state.admin.name}</p>}
      {state.status === 'unauthenticated' && (
        <p data-testid="notice">{state.notice ?? 'sem aviso'}</p>
      )}
      <p data-testid="login-error">{loginError}</p>
      <button
        type="button"
        onClick={() =>
          signIn('ana@finup.com', 'senha').catch((error: Error) => setLoginError(error.message))
        }
      >
        entrar
      </button>
      <button type="button" onClick={() => void signOut()}>
        sair
      </button>
      <button type="button" onClick={dismissNotice}>
        dispensar
      </button>
    </>
  );
}

function renderProvider() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['users'], ['dado de quem saiu']);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { ...view, queryClient, user: userEvent.setup() };
}

function lastHandlers(): HttpAuthHandlers {
  const calls = vi.mocked(setHttpAuthHandlers).mock.calls;
  const handlers = calls.map(([value]) => value).filter(Boolean);
  return handlers[handlers.length - 1] as HttpAuthHandlers;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.hasSession.mockReturnValue(false);
  session.signIn.mockResolvedValue(undefined);
  session.signOut.mockResolvedValue(undefined);
  session.refresh.mockResolvedValue('access');
  adminMe.mockResolvedValue(ADMIN);
  createUser.mockResolvedValue(undefined);
});

describe('AuthProvider sem sessao salva', () => {
  it('comeca deslogado e limpa o cache de quem estava na aba', () => {
    const { queryClient } = renderProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('notice')).toHaveTextContent('sem aviso');
    expect(queryClient.getQueryData(['users'])).toBeUndefined();
    expect(session.refresh).not.toHaveBeenCalled();
  });

  it('entra quando o backend confirma que a pessoa e ADMIN', async () => {
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));

    expect(await screen.findByTestId('admin')).toHaveTextContent('Ana Souza');
    expect(session.signIn).toHaveBeenCalledWith('ana@finup.com', 'senha');
  });

  it('usa o e-mail quando o administrador nao tem nome', async () => {
    adminMe.mockResolvedValue({ ...ADMIN, name: '  ' });
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    expect(await screen.findByTestId('admin')).toHaveTextContent('ana@finup.com');
  });

  it('traduz a falha do Cognito em LoginError', async () => {
    session.signIn.mockRejectedValue(new CognitoError('UserNotFoundException', ''));
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      'E-mail ou senha incorretos.',
    );
    expect(adminMe).not.toHaveBeenCalled();
  });

  it('no primeiro acesso (404), cria o registro local e confere de novo', async () => {
    adminMe.mockRejectedValueOnce(new ApiError(404, null)).mockResolvedValueOnce(ADMIN);
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));

    expect(await screen.findByTestId('admin')).toHaveTextContent('Ana Souza');
    expect(createUser).toHaveBeenCalledTimes(1);
    expect(adminMe).toHaveBeenCalledTimes(2);
  });

  it('aceita o 409 de registro ja existente no primeiro acesso', async () => {
    adminMe.mockRejectedValueOnce(new ApiError(404, null)).mockResolvedValueOnce(ADMIN);
    createUser.mockRejectedValue(new ApiError(409, null));
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    expect(await screen.findByTestId('admin')).toHaveTextContent('Ana Souza');
  });

  it('sai e avisa a validacao quando criar o registro falha', async () => {
    adminMe.mockRejectedValueOnce(new ApiError(404, null));
    createUser.mockRejectedValue(new ApiError(500, null));
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));

    expect(await screen.findByTestId('login-error')).toHaveTextContent(VALIDATION_FAILED_MESSAGE);
    expect(session.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
  });

  it('avisa falta de rede quando o backend nao responde', async () => {
    adminMe.mockRejectedValue(new ApiError(null, null));
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    expect(await screen.findByTestId('login-error')).toHaveTextContent(NETWORK_MESSAGE);
  });

  it.each([
    ['403 do backend', () => adminMe.mockRejectedValue(new ApiError(403, null))],
    ['papel diferente de ADMIN', () => adminMe.mockResolvedValue({ ...ADMIN, role: 'USER' })],
  ])('nega o acesso com %s', async (_, arrange) => {
    arrange();
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));

    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('access-denied'));
    expect(session.signOut).toHaveBeenCalledTimes(1);
  });

  it('dispensa o aviso da sessao', async () => {
    adminMe.mockRejectedValue(new ApiError(403, null));
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('access-denied'));

    await user.click(screen.getByRole('button', { name: 'dispensar' }));
    expect(screen.getByTestId('notice')).toHaveTextContent('sem aviso');

    // Sem aviso, dispensar de novo nao muda nada.
    await user.click(screen.getByRole('button', { name: 'dispensar' }));
    expect(screen.getByTestId('notice')).toHaveTextContent('sem aviso');
  });

  it('sai da sessao e revoga o refresh token', async () => {
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await screen.findByTestId('admin');

    await user.click(screen.getByRole('button', { name: 'sair' }));

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(session.signOut).toHaveBeenCalledTimes(1);
  });
});

describe('AuthProvider com sessao salva (reload)', () => {
  beforeEach(() => {
    session.hasSession.mockReturnValue(true);
  });

  it('renova o token, confere o ADMIN e entra direto', async () => {
    renderProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(await screen.findByTestId('admin')).toHaveTextContent('Ana Souza');
    expect(session.refresh).toHaveBeenCalledTimes(1);
  });

  it('nega o acesso de quem perdeu o papel de ADMIN', async () => {
    adminMe.mockResolvedValue({ ...ADMIN, role: 'USER' });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('access-denied'));
    expect(session.signOut).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'refresh token expirado',
      () => session.refresh.mockRejectedValue(new CognitoError('NotAuthorizedException', '')),
    ],
    ['401 do backend', () => adminMe.mockRejectedValue(new ApiError(401, null))],
  ])('trata %s como sessao expirada', async (_, arrange) => {
    arrange();
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('session-expired'));
    expect(session.clear).toHaveBeenCalledTimes(1);
  });

  it('mantem o refresh token quando a falha e temporaria', async () => {
    session.refresh.mockRejectedValue(new TypeError('Failed to fetch'));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('unavailable'));
    expect(session.clear).not.toHaveBeenCalled();
  });

  it('ignora o resultado que chega depois de desmontar', async () => {
    let resolveRefresh: (token: string) => void = () => undefined;
    session.refresh.mockReturnValue(new Promise((resolve) => (resolveRefresh = resolve)));
    const { unmount } = renderProvider();
    unmount();

    await act(async () => resolveRefresh('access'));

    expect(setHttpAuthHandlers).toHaveBeenLastCalledWith(null);
  });

  it('ignora a falha que chega depois de desmontar', async () => {
    let rejectRefresh: (error: unknown) => void = () => undefined;
    session.refresh.mockReturnValue(new Promise((_, reject) => (rejectRefresh = reject)));
    const { unmount } = renderProvider();
    unmount();

    await act(async () => rejectRefresh(new TypeError('Failed to fetch')));

    expect(session.clear).not.toHaveBeenCalled();
  });
});

describe('handlers entregues ao httpClient', () => {
  it('liga o token da sessao ao httpClient e desliga ao desmontar', () => {
    const { unmount } = renderProvider();
    const handlers = lastHandlers();
    expect(handlers.getAccessToken).toBe(session.getValidAccessToken);
    expect(handlers.refreshAccessToken).toBe(session.refresh);
    expect(handlers.isSessionEnded(new CognitoError('NoSession', ''))).toBe(true);

    unmount();
    expect(setHttpAuthHandlers).toHaveBeenLastCalledWith(null);
  });

  it('so encerra por expiracao ou falta de permissao quem ja estava dentro', async () => {
    const { user } = renderProvider();
    const handlers = lastHandlers();

    act(() => {
      handlers.onSessionExpired();
      handlers.onAccessDenied();
    });
    expect(screen.getByTestId('notice')).toHaveTextContent('sem aviso');
    expect(session.clear).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await screen.findByTestId('admin');
    act(() => handlers.onSessionExpired());

    expect(screen.getByTestId('notice')).toHaveTextContent('session-expired');
    expect(session.clear).toHaveBeenCalledTimes(1);
  });

  it('desloga com acesso negado no 403 durante o uso', async () => {
    const { user } = renderProvider();
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    await screen.findByTestId('admin');

    act(() => lastHandlers().onAccessDenied());

    expect(screen.getByTestId('notice')).toHaveTextContent('access-denied');
    expect(session.signOut).toHaveBeenCalledTimes(1);
  });
});
