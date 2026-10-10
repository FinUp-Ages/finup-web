import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/*
 * Previsao da funcao que sera implementada quando a integracao estiver pronta:
 *
 * async function autenticarUsuario(email: string, senha: string) {
 *   const resposta = await httpClient.post('/auth/login', { email, senha });
 *   return resposta.data;
 * }
 *
 * A funcao devera ser movida para features/auth/api/ e chamada pelo fluxo de
 * submit. A rota e o formato da resposta devem seguir o contrato do Swagger.
 * Em caso de erro, o componente devera exibir uma mensagem generica.
 */
export function UsuarioLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ email: '', senha: '' });
  const [sucesso, setSucesso] = useState('');

  const novaMensagem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const mensagens = {
      email: !email.trim()
        ? 'Digite seu e-mail.'
        : !validarEmail(email)
          ? 'Digite um e-mail válido.'
          : '',
      senha: !senha.trim() ? 'Digite sua senha.' : '',
    };

    setMensagem(mensagens);

    if (mensagens.email || mensagens.senha) {
      setSucesso('');
      return;
    }

    /*
     * Fluxo futuro de integracao com o backend:
     *
     * 1. Enviar email e senha para a rota de login documentada no Swagger.
     * 2. O backend valida as credenciais e consulta a base de dados.
     * 3. Em caso de sucesso, armazenar o token retornado e liberar o acesso.
     * 4. Em caso de erro, exibir uma mensagem generica sem revelar se o email
     *    existe na base de dados.
     *
     * Essa chamada ainda nao deve ser ativada. Por enquanto, o sucesso abaixo
     * é apenas local para manter a tela funcionando sem depender do backend.
     */
    setSucesso('Login bem sucedido!');
    setEmail('');
    setSenha('');
  };

  return (
    <form
      onSubmit={novaMensagem}
      className="mx-auto flex w-[min(calc(100%-42px),320px)] flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="sr-only">
          E-mail
        </label>
        <Input
          id="login-email"
          type="email"
          className={`h-10 w-full rounded-[5px] border-0 bg-login-field px-4 text-xs text-black outline-none placeholder:text-black placeholder:opacity-100 focus:shadow-[0_0_0_2px_rgba(2,23,54,0.2)] ${mensagem.email ? 'shadow-[0_0_0_1px_rgba(220,38,38,1)]' : ''}`}
          placeholder="E-mail"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setMensagem((estadoAtual) => ({ ...estadoAtual, email: '' }));
            setSucesso('');
          }}
        />
        <span className="min-h-[14px] text-right text-[10px] leading-[1.3] text-login-error">
          {mensagem.email}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="sr-only">
          Senha
        </label>
        <Input
          id="login-password"
          type="password"
          className={`h-10 w-full rounded-[5px] border-0 bg-login-field px-4 text-xs text-black outline-none placeholder:text-black placeholder:opacity-100 focus:shadow-[0_0_0_2px_rgba(2,23,54,0.2)] ${mensagem.senha ? 'shadow-[0_0_0_1px_rgba(220,38,38,1)]' : ''}`}
          placeholder="Senha"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value);
            setMensagem((estadoAtual) => ({ ...estadoAtual, senha: '' }));
            setSucesso('');
          }}
        />
        <span className="min-h-[14px] text-right text-[10px] leading-[1.3] text-login-error">
          {mensagem.senha}
        </span>
      </div>

      {sucesso && (
        <span className="min-h-[14px] text-center text-xs font-bold text-login-success">
          {sucesso}
        </span>
      )}

      <Button type="submit" className="mt-[14px]">
        Entrar
      </Button>
    </form>
  );
}
