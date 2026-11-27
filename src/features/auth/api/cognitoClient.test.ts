import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEnv, setEnv } from '@/test/env';
import { CognitoError, cognitoRequest } from './cognitoClient';

vi.mock('@/shared/config/env', async () =>
  (await import('@/test/env')).mockEnv({
    cognito: { region: 'us-east-1', clientId: 'client-painel' },
  }),
);

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body: string, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers });
}

beforeEach(() => {
  resetEnv();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cognitoRequest', () => {
  it('envia a operacao no X-Amz-Target com o client ID no corpo', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, '{"AuthenticationResult":{"AccessToken":"a"}}'));

    const result = await cognitoRequest('InitiateAuth', { AuthFlow: 'USER_AUTH' });

    expect(result).toEqual({ AuthenticationResult: { AccessToken: 'a' } });
    expect(fetchMock).toHaveBeenCalledWith('https://cognito-idp.us-east-1.amazonaws.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({ ClientId: 'client-painel', AuthFlow: 'USER_AUTH' }),
    });
  });

  it('devolve objeto vazio quando o corpo de sucesso vem vazio', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, ''));
    await expect(cognitoRequest('RevokeToken', { Token: 't' })).resolves.toEqual({});
  });

  it.each([
    ['regiao', { region: '', clientId: 'client-painel' }],
    ['client ID', { region: 'us-east-1', clientId: '' }],
  ])('falha sem chamar a rede quando falta %s', async (_, cognito) => {
    setEnv({ cognito });
    await expect(cognitoRequest('InitiateAuth', {})).rejects.toMatchObject({
      name: 'CognitoError',
      code: 'MissingConfiguration',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('le o codigo do __type do corpo, sem o namespace', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        400,
        JSON.stringify({
          __type: 'com.amazonaws.cognito#NotAuthorizedException',
          message: 'Incorrect username or password.',
        }),
      ),
    );

    const error = await cognitoRequest('InitiateAuth', {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CognitoError);
    expect(error).toMatchObject({
      code: 'NotAuthorizedException',
      message: 'Incorrect username or password.',
    });
  });

  it('usa o header x-amzn-ErrorType e a mensagem em Message quando nao ha __type', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, JSON.stringify({ Message: 'Rate exceeded' }), {
        'x-amzn-ErrorType': 'TooManyRequestsException:http://internal.amazon.com/',
      }),
    );

    await expect(cognitoRequest('InitiateAuth', {})).rejects.toMatchObject({
      code: 'TooManyRequestsException',
      message: 'Rate exceeded',
    });
  });

  it('cai no status HTTP quando o corpo nao e JSON e nao ha header de erro', async () => {
    fetchMock.mockResolvedValue(jsonResponse(503, '<html>indisponivel</html>'));

    await expect(cognitoRequest('InitiateAuth', {})).rejects.toMatchObject({
      code: 'HttpError503',
      message: 'HttpError503',
    });
  });

  it('deixa o TypeError da falta de rede seguir para quem chamou', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(cognitoRequest('InitiateAuth', {})).rejects.toBeInstanceOf(TypeError);
  });
});
