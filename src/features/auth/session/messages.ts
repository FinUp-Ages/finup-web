/**
 * Textos que a tela de login mostra quando algo da errado.
 *
 * Nenhum deles repete a mensagem tecnica do Cognito ou do backend, e o login nao diferencia
 * "conta nao existe" de "senha errada".
 */
import { CognitoError } from '../api/cognitoClient';
import type { AuthNotice } from '../types';

/** Falha no login, ja com a mensagem para a pessoa. */
export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginError';
  }
}

export const GENERIC_MESSAGE = 'Não foi possível entrar agora. Tente novamente.';
const TOO_MANY_ATTEMPTS = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
export const NETWORK_MESSAGE =
  'Não foi possível conectar. Verifique sua conexão e tente novamente.';
export const VALIDATION_FAILED_MESSAGE = 'Não foi possível validar seu acesso. Tente novamente.';
const ASK_ADMIN = 'Fale com a pessoa administradora do sistema.';

/** Mensagem para um erro do login no Cognito. */
export function signInErrorMessage(error: unknown): string {
  if (!(error instanceof CognitoError)) {
    // fetch() rejeita com TypeError quando nao ha rede.
    return error instanceof TypeError ? NETWORK_MESSAGE : GENERIC_MESSAGE;
  }

  switch (error.code) {
    case 'NotAuthorizedException':
      // O Cognito usa a mesma excecao para senha errada e para tentativas demais.
      return /attempts exceeded/i.test(error.message)
        ? TOO_MANY_ATTEMPTS
        : 'E-mail ou senha incorretos.';
    case 'UserNotFoundException':
      return 'E-mail ou senha incorretos.';
    case 'UserNotConfirmedException':
      return `Sua conta ainda não foi confirmada. ${ASK_ADMIN}`;
    case 'PasswordResetRequiredException':
      return `Sua senha precisa ser redefinida. ${ASK_ADMIN}`;
    case 'TooManyRequestsException':
    case 'LimitExceededException':
    case 'TooManyFailedAttemptsException':
      return TOO_MANY_ATTEMPTS;
    case 'Challenge.NEW_PASSWORD_REQUIRED':
      return `Sua conta precisa de uma nova senha antes do primeiro acesso. ${ASK_ADMIN}`;
    case 'MissingConfiguration':
      return 'O login não está configurado neste ambiente.';
    default:
      return error.code.startsWith('Challenge.')
        ? `Não foi possível entrar com esta conta. ${ASK_ADMIN}`
        : GENERIC_MESSAGE;
  }
}

export const noticeMessages: Record<AuthNotice, string> = {
  'session-expired': 'Sua sessão expirou. Entre novamente.',
  'access-denied': `Acesso negado. Sua conta não tem permissão para acessar o painel. ${ASK_ADMIN}`,
  unavailable: 'Não foi possível conectar ao servidor. Tente novamente.',
};
