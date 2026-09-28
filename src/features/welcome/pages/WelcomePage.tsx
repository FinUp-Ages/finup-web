import {
  ButtonDestaque,
  graficos,
  Header,
  HeaderDestaque,
  PrimeiroAcesso,
  pilhasLivros,
  UsuarioLogin,
} from '@/features/auth';

export function WelcomePage() {
  return (
    <div className="auth-page">
      <main className="auth-panel">
        <Header />
        <UsuarioLogin />
        <PrimeiroAcesso />
      </main>

      <div className="auth-panel-destaque">
        <img className="destaque-graphs" src={graficos} alt="" />
        <HeaderDestaque />
        <ButtonDestaque type="submit">Baixe o app</ButtonDestaque>
        <img className="destaque-books" src={pilhasLivros} alt="" />
      </div>
    </div>
  );
}
