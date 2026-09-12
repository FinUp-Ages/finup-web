/**
 * Componente raiz.
 * Responsavel apenas por montar os providers globais (QueryClient, Router, contexts)
 * e delegar as rotas. Nenhuma tela ou regra de negocio deve viver aqui.
 */

import Header from './components/common/Header';
import PrimeiroAcesso from './components/common/PrimeiroAcesso';
import UsuarioLogin from './components/common/UsuarioLogin';

export default function App() {
  return (
    <main className="auth-panel">
      <Header />
      <UsuarioLogin />
      <PrimeiroAcesso />
    </main>
  );
}
