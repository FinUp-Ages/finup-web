import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CognitoError, cognitoRequest } from '../api/cognitoClient';
import { authSession, isSessionEndedError } from './authSession';

vi.mock('../api/cognitoClient', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/cognitoClient')>()),
  cognitoRequest: vi.fn(),
}));

const request = vi.mocked(cognitoRequest);
const REFRESH_TOKEN_KEY = 'finup.auth.refreshToken';

function tokens(accessToken: string, refreshToken?: string, expiresIn = 3600) {
  return {
    AuthenticationResult: {
      AccessToken: accessToken,
      ExpiresIn: expiresIn,
      RefreshToken: refreshToken,
    },
  };
}

beforeEach(() => {
  authSession.clear();
  sessionStorage.clear();
  request.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('signIn', () => {
  it('entra pelo USER_AUTH com senha e guarda so o refresh token no storage', async () => {
    request.mockResolvedValue(tokens('access-1', 'refresh-1'));

    await authSession.signIn('admin@finup.com', 'segredo');

    expect(request).toHaveBeenCalledWith('InitiateAuth', {
      AuthFlow: 'USER_AUTH',
      AuthParameters: {
        USERNAME: 'admin@finup.com',
        PREFERRED_CHALLENGE: 'PASSWORD',
        PASSWORD: 'segredo',
      },
    });
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(authSession.hasSession()).toBe(true);
    await expect(authSession.getValidAccessToken()).resolves.toBe('access-1');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('transforma um desafio do Cognito em erro Challenge.<nome>', async () => {
    request.mockResolvedValue({ ChallengeName: 'NEW_PASSWORD_REQUIRED' });

    await expect(authSession.signIn('a@b.com', 'x')).rejects.toMatchObject({
      code: 'Challenge.NEW_PASSWORD_REQUIRED',
    });
    expect(authSession.hasSession()).toBe(false);
  });

  it('usa Challenge.Unknown quando o desafio vem sem nome', async () => {
    request.mockResolvedValue({});
    await expect(authSession.signIn('a@b.com', 'x')).rejects.toMatchObject({
      code: 'Challenge.Unknown',
    });
  });

  it('recusa login sem refresh token', async () => {
    request.mockResolvedValue(tokens('access-1'));
    await expect(authSession.signIn('a@b.com', 'x')).rejects.toMatchObject({
      code: 'MissingRefreshToken',
    });
    expect(authSession.hasSession()).toBe(false);
  });
});

describe('getValidAccessToken e refresh', () => {
  it('devolve null sem sessao salva', async () => {
    await expect(authSession.getValidAccessToken()).resolves.toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it('renova pelo refresh token quando o access token esta perto de vencer', async () => {
    request.mockResolvedValueOnce(tokens('access-1', 'refresh-1', 20));
    await authSession.signIn('a@b.com', 'x');
    request.mockResolvedValueOnce(tokens('access-2'));

    await expect(authSession.getValidAccessToken()).resolves.toBe('access-2');

    expect(request).toHaveBeenLastCalledWith('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: 'refresh-1' },
    });
    // Sem rotacao, o refresh token continua o mesmo.
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
  });

  it('guarda o refresh token novo quando o pool rotaciona', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockResolvedValue(tokens('access-2', 'refresh-2'));

    await expect(authSession.refresh()).resolves.toBe('access-2');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('divide a mesma renovacao entre chamadas simultaneas', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockResolvedValue(tokens('access-2'));

    const [first, second] = await Promise.all([authSession.refresh(), authSession.refresh()]);

    expect(first).toBe('access-2');
    expect(second).toBe('access-2');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('falha com NoSession quando nao ha refresh token', async () => {
    await expect(authSession.refresh()).rejects.toMatchObject({ code: 'NoSession' });
  });

  it('apaga a sessao quando o refresh token expirou', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockRejectedValue(new CognitoError('NotAuthorizedException', 'expired'));

    await expect(authSession.refresh()).rejects.toMatchObject({ code: 'NotAuthorizedException' });
    expect(authSession.hasSession()).toBe(false);
  });

  it('mantem o refresh token quando a falha e temporaria', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(authSession.refresh()).rejects.toBeInstanceOf(TypeError);
    expect(authSession.hasSession()).toBe(true);
  });

  it('trata desafio na renovacao como erro', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockResolvedValue({ ChallengeName: 'SMS_MFA' });
    await expect(authSession.refresh()).rejects.toMatchObject({ code: 'Challenge.SMS_MFA' });
  });
});

describe('signOut e clear', () => {
  it('apaga os tokens e revoga o refresh token no Cognito', async () => {
    request.mockResolvedValueOnce(tokens('access-1', 'refresh-1'));
    await authSession.signIn('a@b.com', 'x');
    request.mockResolvedValueOnce({});

    await authSession.signOut();

    expect(request).toHaveBeenLastCalledWith('RevokeToken', { Token: 'refresh-1' });
    expect(authSession.hasSession()).toBe(false);
    await expect(authSession.getValidAccessToken()).resolves.toBeNull();
  });

  it('conclui o logout mesmo quando a revogacao falha', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-1');
    request.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(authSession.signOut()).resolves.toBeUndefined();
    expect(authSession.hasSession()).toBe(false);
  });

  it('nao chama o Cognito quando nao ha sessao', async () => {
    await authSession.signOut();
    expect(request).not.toHaveBeenCalled();
  });

  it('continua funcionando quando o sessionStorage esta indisponivel', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    request.mockResolvedValue(tokens('access-1', 'refresh-1'));

    await authSession.signIn('a@b.com', 'x');

    expect(authSession.hasSession()).toBe(false);
    await expect(authSession.getValidAccessToken()).resolves.toBe('access-1');
    expect(() => authSession.clear()).not.toThrow();
  });
});

describe('isSessionEndedError', () => {
  it.each([
    [new CognitoError('NotAuthorizedException', ''), true],
    [new CognitoError('NoSession', ''), true],
    [new CognitoError('TooManyRequestsException', ''), false],
    [new TypeError('Failed to fetch'), false],
    [null, false],
  ])('classifica %s', (error, expected) => {
    expect(isSessionEndedError(error)).toBe(expected);
  });
});
