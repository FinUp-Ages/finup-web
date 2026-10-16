/**
 * Sessao do painel no Cognito: login, renovacao e logout, e onde cada token fica.
 *
 * - Access token: so em memoria. E ele que vai no Authorization; o backend recusa o ID token.
 * - Refresh token: no sessionStorage, para a sessao sobreviver a um reload. Some quando a
 *   aba fecha e nao e compartilhado com outras abas. Como todo storage do navegador, um
 *   script da pagina consegue ler; por isso nunca vai para log nem para a URL.
 * - ID token: descartado.
 *
 * O login usa USER_AUTH com PREFERRED_CHALLENGE=PASSWORD, como o finup-mobile. O app client
 * do painel precisa ter o fluxo ALLOW_USER_AUTH habilitado.
 */
import { CognitoError, cognitoRequest } from '../api/cognitoClient';

const REFRESH_TOKEN_KEY = 'finup.auth.refreshToken';

// Renova quando faltar menos que isso para expirar: cobre relogio desregulado e a
// latencia ate o backend validar o token.
const EXPIRY_LEEWAY_MS = 30_000;

type AuthenticationResult = {
  AccessToken: string;
  ExpiresIn: number;
  RefreshToken?: string;
};

type InitiateAuthResponse = {
  AuthenticationResult?: AuthenticationResult;
  ChallengeName?: string;
};

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;

// Chamadas simultaneas (varias requisicoes com o token vencido) dividem a mesma
// renovacao: com rotacao de refresh token ligada, a segunda usaria um token ja trocado.
let refreshInFlight: Promise<string> | null = null;

function readRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // Sem storage disponivel, a sessao dura so ate o proximo reload.
  }
}

function clear(): void {
  accessToken = null;
  accessTokenExpiresAt = 0;
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // nada a remover
  }
}

/**
 * Qualquer desafio no lugar do AuthenticationResult (ex.: NEW_PASSWORD_REQUIRED, de conta
 * criada com senha temporaria) vira erro com o codigo "Challenge.<nome>". O painel nao
 * conclui desafios: so orienta a pessoa.
 */
function requireAuthenticationResult(response: InitiateAuthResponse): AuthenticationResult {
  if (!response.AuthenticationResult) {
    throw new CognitoError(
      `Challenge.${response.ChallengeName ?? 'Unknown'}`,
      'O Cognito pediu um desafio no lugar dos tokens.',
    );
  }
  return response.AuthenticationResult;
}

function storeAccessToken(result: AuthenticationResult): void {
  accessToken = result.AccessToken;
  accessTokenExpiresAt = Date.now() + result.ExpiresIn * 1000;
}

async function refresh(): Promise<string> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    throw new CognitoError('NoSession', 'Nenhuma sessao salva.');
  }

  let response: InitiateAuthResponse;
  try {
    response = await cognitoRequest<InitiateAuthResponse>('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    });
  } catch (error) {
    // Refresh expirado ou revogado: a sessao acabou. Outras falhas (ex.: sem rede)
    // mantem o refresh token, para tentar de novo depois.
    if (error instanceof CognitoError && error.code === 'NotAuthorizedException') {
      clear();
    }
    throw error;
  }

  const result = requireAuthenticationResult(response);
  storeAccessToken(result);
  // So vem um refresh token novo se o pool tiver rotacao ligada.
  if (result.RefreshToken) {
    writeRefreshToken(result.RefreshToken);
  }
  return result.AccessToken;
}

export const authSession = {
  hasSession: (): boolean => readRefreshToken() !== null,

  signIn: async (email: string, password: string): Promise<void> => {
    const response = await cognitoRequest<InitiateAuthResponse>('InitiateAuth', {
      AuthFlow: 'USER_AUTH',
      AuthParameters: {
        USERNAME: email,
        PREFERRED_CHALLENGE: 'PASSWORD',
        PASSWORD: password,
      },
    });
    const result = requireAuthenticationResult(response);
    if (!result.RefreshToken) {
      throw new CognitoError('MissingRefreshToken', 'O Cognito nao devolveu o refresh token.');
    }
    storeAccessToken(result);
    writeRefreshToken(result.RefreshToken);
  },

  /**
   * Access token pronto para o Authorization, ou null sem sessao. Vencido, renova antes.
   * Erros da renovacao seguem para quem chamou.
   */
  getValidAccessToken: async (): Promise<string | null> => {
    if (accessToken && Date.now() < accessTokenExpiresAt - EXPIRY_LEEWAY_MS) {
      return accessToken;
    }
    if (!readRefreshToken()) {
      return null;
    }
    return authSession.refresh();
  },

  /** Renova o access token pelo refresh token. Chamadas simultaneas dividem a mesma. */
  refresh: (): Promise<string> => {
    refreshInFlight ??= refresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  },

  /** Apaga os tokens desta aba, sem avisar o Cognito. */
  clear,

  /**
   * Apaga os tokens e revoga o refresh token no Cognito, para ele nao gerar novos access
   * tokens. Falha na revogacao nao impede o logout: a sessao local ja foi apagada.
   * O access token ja emitido continua aceito pelo backend ate expirar.
   */
  signOut: async (): Promise<void> => {
    const refreshToken = readRefreshToken();
    clear();
    if (refreshToken) {
      await cognitoRequest('RevokeToken', { Token: refreshToken }).catch(() => undefined);
    }
  },
};
