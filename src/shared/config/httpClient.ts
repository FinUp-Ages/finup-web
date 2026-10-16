/**
 * Instancia unica do Axios.
 * Concentra: baseURL por ambiente, injecao do token de autenticacao,
 * tratamento de 401 e normalizacao de erro da API.
 *
 * Somente arquivos de features/<nome>/api/ importam este cliente. Pages, hooks e
 * components nunca importam axios nem httpClient diretamente.
 *
 * O httpClient nao conhece o Cognito: quem tem a sessao (features/auth) registra os
 * handlers com setHttpAuthHandlers. Assim shared/ continua sem importar features/.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toApiError } from '@/shared/config/apiError';
import { env } from '@/shared/config/env';

export interface HttpAuthHandlers {
  /** Access token valido para o Authorization, ou null sem sessao. */
  getAccessToken: () => Promise<string | null>;
  /** Renova o access token. Rejeita quando a sessao nao pode mais ser renovada. */
  refreshAccessToken: () => Promise<string>;
  /** O 401 continuou depois de renovar: a sessao acabou. */
  onSessionExpired: () => void;
  /** 403 de falta de permissao (ver ApiError.isAccessDenied). */
  onAccessDenied: () => void;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { authRetried?: boolean };

let authHandlers: HttpAuthHandlers | null = null;

export function setHttpAuthHandlers(handlers: HttpAuthHandlers | null): void {
  authHandlers = handlers;
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
});

httpClient.interceptors.request.use(async (config) => {
  // Falha ao obter o token (ex.: sem rede para renovar) segue sem Authorization:
  // o 401 do backend leva ao tratamento abaixo.
  const token = await authHandlers?.getAccessToken().catch(() => null);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

httpClient.interceptors.response.use(undefined, async (error: unknown) => {
  const apiError = toApiError(error);
  const config = axios.isAxiosError(error)
    ? (error.config as RetriableRequestConfig | undefined)
    : undefined;

  if (apiError.status === 401 && authHandlers && config) {
    // Uma unica nova tentativa, com o token renovado.
    if (!config.authRetried) {
      config.authRetried = true;
      try {
        const token = await authHandlers.refreshAccessToken();
        config.headers.set('Authorization', `Bearer ${token}`);
        return httpClient(config);
      } catch {
        // cai no encerramento da sessao abaixo
      }
    }
    authHandlers.onSessionExpired();
  }

  if (apiError.isAccessDenied) {
    authHandlers?.onAccessDenied();
  }

  return Promise.reject(apiError);
});
