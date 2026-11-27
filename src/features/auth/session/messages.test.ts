import { describe, expect, it } from 'vitest';
import { CognitoError } from '../api/cognitoClient';
import {
  GENERIC_MESSAGE,
  LoginError,
  NETWORK_MESSAGE,
  noticeMessages,
  signInErrorMessage,
} from './messages';

const ASK_ADMIN = 'Fale com a pessoa administradora do sistema.';
const TOO_MANY_ATTEMPTS = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';

describe('signInErrorMessage', () => {
  it('trata TypeError do fetch como falta de rede', () => {
    expect(signInErrorMessage(new TypeError('Failed to fetch'))).toBe(NETWORK_MESSAGE);
  });

  it('usa a mensagem generica para erro desconhecido', () => {
    expect(signInErrorMessage(new Error('boom'))).toBe(GENERIC_MESSAGE);
    expect(signInErrorMessage('texto')).toBe(GENERIC_MESSAGE);
  });

  it('nao diferencia senha errada de conta inexistente', () => {
    const wrongPassword = signInErrorMessage(
      new CognitoError('NotAuthorizedException', 'Incorrect username or password.'),
    );
    const missingUser = signInErrorMessage(new CognitoError('UserNotFoundException', ''));
    expect(wrongPassword).toBe('E-mail ou senha incorretos.');
    expect(missingUser).toBe(wrongPassword);
  });

  it('reconhece tentativas demais dentro do NotAuthorizedException', () => {
    expect(
      signInErrorMessage(new CognitoError('NotAuthorizedException', 'Password attempts exceeded')),
    ).toBe(TOO_MANY_ATTEMPTS);
  });

  it.each([
    ['UserNotConfirmedException', `Sua conta ainda não foi confirmada. ${ASK_ADMIN}`],
    ['PasswordResetRequiredException', `Sua senha precisa ser redefinida. ${ASK_ADMIN}`],
    ['TooManyRequestsException', TOO_MANY_ATTEMPTS],
    ['LimitExceededException', TOO_MANY_ATTEMPTS],
    ['TooManyFailedAttemptsException', TOO_MANY_ATTEMPTS],
    [
      'Challenge.NEW_PASSWORD_REQUIRED',
      `Sua conta precisa de uma nova senha antes do primeiro acesso. ${ASK_ADMIN}`,
    ],
    ['MissingConfiguration', 'O login não está configurado neste ambiente.'],
    ['Challenge.SMS_MFA', `Não foi possível entrar com esta conta. ${ASK_ADMIN}`],
    ['InternalErrorException', GENERIC_MESSAGE],
  ])('traduz %s', (code, message) => {
    expect(signInErrorMessage(new CognitoError(code, ''))).toBe(message);
  });
});

describe('noticeMessages e LoginError', () => {
  it('tem uma mensagem para cada aviso de sessao', () => {
    expect(noticeMessages['session-expired']).toBe('Sua sessão expirou. Entre novamente.');
    expect(noticeMessages['access-denied']).toContain('Acesso negado.');
    expect(noticeMessages.unavailable).toBe(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });

  it('LoginError carrega a mensagem para a tela', () => {
    const error = new LoginError('E-mail ou senha incorretos.');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('LoginError');
    expect(error.message).toBe('E-mail ou senha incorretos.');
  });
});
