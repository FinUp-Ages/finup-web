import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiError';
import { httpClient, setHttpAuthHandlers, type HttpAuthHandlers } from './httpClient';

const FORBIDDEN_TYPE = 'https://finup.com.br/errors/forbidden';

type Reply = { status: number; data?: unknown };

/** Adapter falso: responde a cada requisicao com o proximo item da fila e guarda os headers. */
function fakeServer(...replies: Reply[]) {
  const seenAuthorization: (string | undefined)[] = [];
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    seenAuthorization.push(config.headers.get('Authorization') as string | undefined);
    const reply = replies.shift() ?? { status: 200 };
    const response = {
      status: reply.status,
      data: reply.data,
      statusText: '',
      headers: {},
      config,
    } as AxiosResponse;
    if (reply.status >= 400) {
      throw new AxiosError('falha', 'ERR_BAD_RESPONSE', config, null, response);
    }
    return response;
  };
  httpClient.defaults.adapter = adapter;
  return seenAuthorization;
}

function handlers(overrides: Partial<HttpAuthHandlers> = {}): HttpAuthHandlers {
  return {
    getAccessToken: vi.fn().mockResolvedValue('token-1'),
    refreshAccessToken: vi.fn().mockResolvedValue('token-2'),
    isSessionEnded: vi.fn().mockReturnValue(true),
    onSessionExpired: vi.fn(),
    onAccessDenied: vi.fn(),
    ...overrides,
  };
}

const originalAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  setHttpAuthHandlers(null);
});

afterEach(() => {
  httpClient.defaults.adapter = originalAdapter;
  setHttpAuthHandlers(null);
});

describe('httpClient', () => {
  it('sem handlers, envia a requisicao sem Authorization', async () => {
    const seen = fakeServer({ status: 200, data: { ok: true } });

    const { data } = await httpClient.get('/api/v1/teste');

    expect(data).toEqual({ ok: true });
    expect(seen).toEqual([undefined]);
  });

  it('injeta o access token da sessao no Authorization', async () => {
    const seen = fakeServer({ status: 200 });
    setHttpAuthHandlers(handlers());

    await httpClient.get('/api/v1/teste');

    expect(seen).toEqual(['Bearer token-1']);
  });

  it('segue sem Authorization quando obter o token falha', async () => {
    const seen = fakeServer({ status: 200 });
    setHttpAuthHandlers(handlers({ getAccessToken: vi.fn().mockRejectedValue(new Error('x')) }));

    await httpClient.get('/api/v1/teste');

    expect(seen).toEqual([undefined]);
  });

  it('no 401, renova o token e repete a requisicao uma unica vez', async () => {
    const seen = fakeServer({ status: 401 }, { status: 200, data: 'ok' });
    // Como a sessao real: depois de renovar, o token valido passa a ser o novo.
    let current = 'token-1';
    const auth = handlers({
      getAccessToken: vi.fn(async () => current),
      refreshAccessToken: vi.fn(async () => {
        current = 'token-2';
        return current;
      }),
    });
    setHttpAuthHandlers(auth);

    const { data } = await httpClient.get('/api/v1/teste');

    expect(data).toBe('ok');
    expect(seen).toEqual(['Bearer token-1', 'Bearer token-2']);
    expect(auth.onSessionExpired).not.toHaveBeenCalled();
  });

  it('encerra a sessao quando o 401 continua depois de renovar', async () => {
    fakeServer({ status: 401 }, { status: 401 });
    const auth = handlers();
    setHttpAuthHandlers(auth);

    await expect(httpClient.get('/api/v1/teste')).rejects.toMatchObject({ status: 401 });

    expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(auth.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('encerra a sessao quando a renovacao falha porque a sessao acabou', async () => {
    fakeServer({ status: 401 });
    const auth = handlers({ refreshAccessToken: vi.fn().mockRejectedValue(new Error('expirou')) });
    setHttpAuthHandlers(auth);

    const error = await httpClient.get('/api/v1/teste').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(auth.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('mantem a sessao quando a renovacao falha por motivo temporario', async () => {
    fakeServer({ status: 401 });
    const auth = handlers({
      refreshAccessToken: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
      isSessionEnded: vi.fn().mockReturnValue(false),
    });
    setHttpAuthHandlers(auth);

    await expect(httpClient.get('/api/v1/teste')).rejects.toMatchObject({ status: 401 });
    expect(auth.onSessionExpired).not.toHaveBeenCalled();
  });

  it('avisa o acesso negado no 403 do backend', async () => {
    fakeServer({ status: 403, data: { status: 403, type: FORBIDDEN_TYPE } });
    const auth = handlers();
    setHttpAuthHandlers(auth);

    await expect(httpClient.get('/api/v1/admin/me')).rejects.toMatchObject({ status: 403 });
    expect(auth.onAccessDenied).toHaveBeenCalledTimes(1);
  });

  it('normaliza outros erros para ApiError sem chamar os handlers', async () => {
    fakeServer({ status: 404, data: { status: 404, detail: 'Nao encontrado' } });
    const auth = handlers();
    setHttpAuthHandlers(auth);

    await expect(httpClient.get('/api/v1/teste')).rejects.toMatchObject({
      status: 404,
      message: 'Nao encontrado',
    });
    expect(auth.onAccessDenied).not.toHaveBeenCalled();
    expect(auth.onSessionExpired).not.toHaveBeenCalled();
  });

  it('sem handlers, o 401 so vira ApiError', async () => {
    fakeServer({ status: 401 });
    await expect(httpClient.get('/api/v1/teste')).rejects.toMatchObject({ status: 401 });
  });
});
