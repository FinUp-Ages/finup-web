import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,}$/.test(senha);
}

/*
 * Previsao da funcao que sera implementada quando a integracao estiver pronta:
 *
 * async function autenticarUsuario(email: string, senha: string) {
 *   const resposta = await httpClient.post('/auth/login', { email, senha });
 *   return resposta.data;
 * }
 *
 * A funcao devera ser movida para features/example/api/ e chamada pelo fluxo de
 * submit. A rota e o formato da resposta devem seguir o contrato do Swagger.
 * Em caso de erro, o componente devera exibir uma mensagem generica.
 */
function UsuarioLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ email: '', senha: '' });
  const [sucesso, setSucesso] = useState('');

  const novaMensagem = () => {
    const mensagens = {
      email: !email.trim()
        ? 'Digite seu e-mail.'
        : !validarEmail(email)
          ? 'Digite um e-mail válido.'
          : '',
      senha: !senha.trim()
        ? 'Digite sua senha.'
        : !validarSenha(senha)
          ? 'A senha deve ter 8 caracteres, maiúscula, minúscula e especial.'
          : '',
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
    <div className="login-form">
      <div className="input-group">
        <Input
          type="email"
          className={mensagem.email ? 'input-error' : ''}
          placeholder="E-mail"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setMensagem((estadoAtual) => ({ ...estadoAtual, email: '' }));
            setSucesso('');
          }}
        />
        <span className="input-message">{mensagem.email}</span>
      </div>

      <div className="input-group">
        <Input
          type="password"
          className={mensagem.senha ? 'input-error' : ''}
          placeholder="Senha"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value);
            setMensagem((estadoAtual) => ({ ...estadoAtual, senha: '' }));
            setSucesso('');
          }}
        />
        <span className="input-message">{mensagem.senha}</span>
      </div>

      {sucesso && <span className="input-message success-message">{sucesso}</span>}

      <Button onClick={novaMensagem} type="submit">
        Entrar
      </Button>
    </div>
  );
}

export default UsuarioLogin;
