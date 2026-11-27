import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../session/authContext';
import { GENERIC_MESSAGE, LoginError } from '../session/messages';
import { UsuarioLogin } from './UsuarioLogin';

const signIn = vi.fn<AuthContextValue['signIn']>();
const dismissNotice = vi.fn();

function renderLogin(aviso: string | null = null) {
  const value: AuthContextValue = {
    state: { status: 'unauthenticated', notice: null },
    signIn,
    signOut: vi.fn(),
    dismissNotice,
  };
  render(
    <AuthContext.Provider value={value}>
      <UsuarioLogin aviso={aviso} />
    </AuthContext.Provider>,
  );
  return userEvent.setup();
}

const email = () => screen.getByPlaceholderText('E-mail');
const senha = () => screen.getByPlaceholderText('Senha');
const entrar = () => screen.getByRole('button', { name: 'Entrar' });

beforeEach(() => {
  signIn.mockReset();
  dismissNotice.mockReset();
});

describe('UsuarioLogin', () => {
  it('valida os campos vazios e foca o e-mail', async () => {
    const user = renderLogin();
    await user.click(entrar());

    expect(screen.getByText('Digite seu e-mail.')).toBeVisible();
    expect(screen.getByText('Digite sua senha.')).toBeVisible();
    expect(email()).toHaveAttribute('aria-invalid', 'true');
    expect(email()).toHaveFocus();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('recusa e-mail invalido e foca a senha quando so ela falta', async () => {
    const user = renderLogin();
    await user.type(email(), 'ana@finup');
    await user.click(entrar());
    expect(screen.getByText('Digite um e-mail válido.')).toBeVisible();

    await user.clear(email());
    await user.type(email(), 'ana@finup.com');
    expect(screen.queryByText('Digite um e-mail válido.')).not.toBeInTheDocument();
    await user.click(entrar());

    expect(senha()).toHaveFocus();
    expect(screen.getByText('Digite sua senha.')).toBeVisible();
  });

  it('limpa o erro da senha ao digitar', async () => {
    const user = renderLogin();
    await user.click(entrar());
    await user.type(senha(), 'x');
    expect(screen.queryByText('Digite sua senha.')).not.toBeInTheDocument();
  });

  it('entra com o e-mail sem espacos e limpa a senha depois', async () => {
    signIn.mockResolvedValue(undefined);
    const user = renderLogin();
    await user.type(email(), '  ana@finup.com ');
    await user.type(senha(), 'segredo');
    await user.click(entrar());

    expect(signIn).toHaveBeenCalledWith('ana@finup.com', 'segredo');
    expect(dismissNotice).toHaveBeenCalled();
    expect(senha()).toHaveValue('');
  });

  it('mostra o estado de envio e ignora um segundo envio', async () => {
    let finish: () => void = () => undefined;
    signIn.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const user = renderLogin();
    await user.type(email(), 'ana@finup.com');
    await user.type(senha(), 'segredo');
    await user.click(entrar());

    const enviando = screen.getByRole('button', { name: 'Entrando…' });
    expect(enviando).toBeDisabled();
    expect(email()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeDisabled();

    finish();
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeEnabled();
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('mostra a mensagem do LoginError e devolve o foco para a senha', async () => {
    signIn.mockRejectedValue(new LoginError('E-mail ou senha incorretos.'));
    const user = renderLogin();
    await user.type(email(), 'ana@finup.com');
    await user.type(senha(), 'errada');
    await user.click(entrar());

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(senha()).toHaveFocus();
  });

  it('usa a mensagem generica para erro inesperado', async () => {
    signIn.mockRejectedValue(new Error('boom'));
    const user = renderLogin();
    await user.type(email(), 'ana@finup.com');
    await user.type(senha(), 'x');
    await user.click(entrar());
    expect(await screen.findByRole('alert')).toHaveTextContent(GENERIC_MESSAGE);
  });

  it('mostra o aviso da sessao no alerta', () => {
    renderLogin('Sua sessão expirou. Entre novamente.');
    expect(screen.getByRole('alert')).toHaveTextContent('Sua sessão expirou. Entre novamente.');
  });

  it('alterna a visibilidade da senha', async () => {
    const user = renderLogin();
    expect(senha()).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(senha()).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(senha()).toHaveAttribute('type', 'password');
  });
});
