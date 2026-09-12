import { useState } from 'react';
import Button from '../ui/Button';

function UsuarioLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  return (
    <div className="login-form">
      <input
        className="login-input"
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        className="login-input"
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
      />

      <Button />
    </div>
  );
}

export default UsuarioLogin;
