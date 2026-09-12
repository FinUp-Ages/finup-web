import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,}$/.test(senha);
}

function UsuarioLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ email: '', senha: '' });

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
      return;
    }

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
          }}
        />
        <span className="input-message">{mensagem.senha}</span>
      </div>

      <Button onClick={novaMensagem} type="submit">
        Entrar
      </Button>
    </div>
  );
}

export default UsuarioLogin;
