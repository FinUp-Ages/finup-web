/**
 * Dono da sessao do painel. Faz o login no Cognito, confirma com o backend que a pessoa e
 * ADMIN (GET /api/v1/admin/me, contrato C2) e mantem o estado que as rotas consultam.
 *
 * Tambem entrega ao httpClient o access token e o que fazer quando a sessao acaba (401 que
 * a renovacao nao resolve) ou quando falta permissao (403). Esses dois avisos so encerram a
 * sessao de quem ja estava dentro: durante o login, o proprio signIn trata os erros.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { ApiError } from '@/shared/config/apiError';
import { setHttpAuthHandlers } from '@/shared/config/httpClient';
import { CognitoError } from '../api/cognitoClient';
import { createCurrentUser } from '../api/createCurrentUser';
import { getAdminMe } from '../api/getAdminMe';
import { AuthContext, type AuthContextValue } from '../session/authContext';
import { authSession } from '../session/authSession';
import {
  LoginError,
  NETWORK_MESSAGE,
  signInErrorMessage,
  VALIDATION_FAILED_MESSAGE,
} from '../session/messages';
import type { AdminMeDTO, AdminUser, AuthState } from '../types';

type AdminCheck = { kind: 'admin'; admin: AdminUser } | { kind: 'denied' };

function toAdminUser(dto: AdminMeDTO): AdminUser {
  return { id: dto.id, name: dto.name?.trim() || dto.email, email: dto.email };
}

/**
 * Pergunta ao backend quem e a pessoa do token. 404 e o primeiro acesso de um administrador
 * que ainda nao tem registro local: o painel cria o registro e pergunta de novo.
 */
async function checkAdmin(): Promise<AdminCheck> {
  let dto: AdminMeDTO;
  try {
    dto = await getAdminMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { kind: 'denied' };
    }
    if (!(error instanceof ApiError && error.status === 404)) {
      throw error;
    }
    await createCurrentUser().catch((creationError: unknown) => {
      if (!(creationError instanceof ApiError && creationError.status === 409)) {
        throw creationError;
      }
    });
    dto = await getAdminMe();
  }
  return dto.role === 'ADMIN' ? { kind: 'admin', admin: toAdminUser(dto) } : { kind: 'denied' };
}

const deniedState: AuthState = { status: 'unauthenticated', notice: 'access-denied' };

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(() =>
    authSession.hasSession() ? { status: 'loading' } : { status: 'unauthenticated', notice: null },
  );

  // Os handlers do httpClient sao chamados fora do React: leem o status mais recente daqui.
  const statusRef = useRef(state.status);
  useEffect(() => {
    statusRef.current = state.status;
  }, [state.status]);

  useEffect(() => {
    setHttpAuthHandlers({
      getAccessToken: authSession.getValidAccessToken,
      refreshAccessToken: authSession.refresh,
      onSessionExpired: () => {
        if (statusRef.current !== 'authenticated') return;
        authSession.clear();
        setState({ status: 'unauthenticated', notice: 'session-expired' });
      },
      onAccessDenied: () => {
        if (statusRef.current !== 'authenticated') return;
        void authSession.signOut();
        setState(deniedState);
      },
    });
    return () => setHttpAuthHandlers(null);
  }, []);

  // Reload com sessao salva: renova o access token e confirma de novo que e ADMIN.
  useEffect(() => {
    if (!authSession.hasSession()) return;
    let active = true;

    authSession
      .refresh()
      .then(checkAdmin)
      .then(async (result) => {
        if (!active) return;
        if (result.kind === 'denied') {
          await authSession.signOut();
          setState(deniedState);
          return;
        }
        setState({ status: 'authenticated', admin: result.admin });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const expired =
          (error instanceof CognitoError && error.code === 'NotAuthorizedException') ||
          (error instanceof ApiError && error.status === 401);
        authSession.clear();
        setState({
          status: 'unauthenticated',
          notice: expired ? 'session-expired' : 'unavailable',
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authSession.signIn(email, password);
    } catch (error) {
      throw new LoginError(signInErrorMessage(error));
    }

    let result: AdminCheck;
    try {
      result = await checkAdmin();
    } catch (error) {
      await authSession.signOut();
      throw new LoginError(
        error instanceof ApiError && error.status !== null
          ? VALIDATION_FAILED_MESSAGE
          : NETWORK_MESSAGE,
      );
    }

    if (result.kind === 'denied') {
      await authSession.signOut();
      setState(deniedState);
      return;
    }
    setState({ status: 'authenticated', admin: result.admin });
  }, []);

  const signOut = useCallback(async () => {
    setState({ status: 'unauthenticated', notice: null });
    await authSession.signOut();
  }, []);

  const dismissNotice = useCallback(() => {
    setState((current) =>
      current.status === 'unauthenticated' && current.notice
        ? { status: 'unauthenticated', notice: null }
        : current,
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signOut, dismissNotice }),
    [state, signIn, signOut, dismissNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
