import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { GENERIC_MESSAGE, LoginError } from '../session/messages';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type UsuarioLoginProps = {
  /** Aviso vindo da sessao (expirada, acesso negado), mostrado ate a proxima tentativa. */
  aviso: string | null;
};

/**
 * Formulario de login. Valida os campos, entra pelo Cognito e deixa o redirecionamento
 * para a LoginPage, que reage quando a sessao fica autenticada.
 */
export function UsuarioLogin({ aviso }: UsuarioLoginProps) {
  const { signIn, dismissNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ email: '', senha: '' });
  const [erroLogin, setErroLogin] = useState('');
  const [enviando, setEnviando] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const senhaRef = useRef<HTMLInputElement>(null);

  // Depois de um erro, o foco volta para a senha, ja liberada para digitar de novo.
  useEffect(() => {
    if (erroLogin) senhaRef.current?.focus();
  }, [erroLogin]);

  const entrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviando) return;

    const mensagens = {
      email: !email.trim()
        ? 'Digite seu e-mail.'
        : !validarEmail(email.trim())
          ? 'Digite um e-mail válido.'
          : '',
      senha: !senha ? 'Digite sua senha.' : '',
    };
    setMensagem(mensagens);
    setErroLogin('');
    dismissNotice();

    if (mensagens.email || mensagens.senha) {
      (mensagens.email ? emailRef : senhaRef).current?.focus();
      return;
    }

    setEnviando(true);
    try {
      await signIn(email.trim(), senha);
    } catch (error) {
      setErroLogin(error instanceof LoginError ? error.message : GENERIC_MESSAGE);
    } finally {
      setSenha('');
      setEnviando(false);
    }
  };

  const alerta = erroLogin || aviso;

  return (
    <form
      onSubmit={(event) => void entrar(event)}
      noValidate
      aria-busy={enviando}
      className="flex flex-col gap-8"
    >
      <div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="sr-only">
              E-mail
            </label>
            <Input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="E-mail"
              value={email}
              disabled={enviando}
              aria-invalid={mensagem.email ? true : undefined}
              aria-describedby={mensagem.email ? 'login-email-erro' : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                setMensagem((estadoAtual) => ({ ...estadoAtual, email: '' }));
              }}
            />
            {mensagem.email && (
              <span id="login-email-erro" className="text-right text-xs text-login-error">
                {mensagem.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="sr-only">
              Senha
            </label>
            <Input
              ref={senhaRef}
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Senha"
              value={senha}
              disabled={enviando}
              aria-invalid={mensagem.senha ? true : undefined}
              aria-describedby={mensagem.senha ? 'login-password-erro' : undefined}
              onChange={(event) => {
                setSenha(event.target.value);
                setMensagem((estadoAtual) => ({ ...estadoAtual, senha: '' }));
              }}
            />
            {mensagem.senha && (
              <span id="login-password-erro" className="text-right text-xs text-login-error">
                {mensagem.senha}
              </span>
            )}
          </div>
        </div>

        {/* Sempre no DOM, para o leitor de tela anunciar quando a mensagem aparece. */}
        <div role="alert" className="[&:not(:empty)]:mt-4">
          {alerta && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm leading-[18px] text-login-error">
              {alerta}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={enviando}>
        {enviando && <Loader2 aria-hidden="true" size={18} className="animate-spin" />}
        {enviando ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
