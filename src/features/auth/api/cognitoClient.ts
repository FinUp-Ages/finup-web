/**
 * Cliente da API publica do AWS Cognito (User Pool do FinUp).
 *
 * Mesmo papel do httpClient, mas para o Cognito: e o unico lugar que chama fetch()
 * para a AWS. As operacoes usadas (InitiateAuth, RevokeToken) nao exigem credencial
 * da AWS nem SDK: todas sao um POST no mesmo endpoint, mudando so o header
 * X-Amz-Target. E a mesma abordagem do finup-mobile (src/config/cognitoClient.ts).
 *
 * Regiao e client ID nao sao segredo: o app client do painel nao tem client secret.
 */
import { env } from '@/shared/config/env';

/**
 * Erro devolvido pelo Cognito. `code` e o nome da excecao (ex.: "NotAuthorizedException"):
 * e por ele que a tela decide a mensagem.
 */
export class CognitoError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message || code);
    this.name = 'CognitoError';
    this.code = code;
  }
}

type CognitoErrorBody = {
  __type?: string;
  message?: string;
  Message?: string;
};

// O nome da excecao pode vir como "NotAuthorizedException",
// "com.amazonaws...#NotAuthorizedException" (corpo) ou
// "NotAuthorizedException:http://..." (header x-amzn-ErrorType).
function parseErrorCode(raw: string): string {
  const withoutNamespace = raw.split('#').pop() ?? raw;
  return withoutNamespace.split(':')[0];
}

async function parseBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Sem rede, o fetch() rejeita com TypeError, que segue para quem chamou. */
export async function cognitoRequest<T>(
  operation: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { region, clientId } = env.cognito;
  if (!region || !clientId) {
    throw new CognitoError(
      'MissingConfiguration',
      'VITE_COGNITO_REGION ou VITE_COGNITO_CLIENT_ID nao configurado.',
    );
  }

  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
    },
    body: JSON.stringify({ ClientId: clientId, ...body }),
  });

  const json = await parseBody(response);

  if (!response.ok) {
    const error = json as CognitoErrorBody;
    const rawCode =
      error.__type ?? response.headers.get('x-amzn-ErrorType') ?? `HttpError${response.status}`;
    throw new CognitoError(parseErrorCode(rawCode), error.message ?? error.Message ?? '');
  }

  return json as T;
}
