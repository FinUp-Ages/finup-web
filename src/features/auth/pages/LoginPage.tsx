import { ButtonDestaque } from '../components/ButtonDestaque';
import { Header } from '../components/Header';
import { HeaderDestaque } from '../components/HeaderDestaque';
import { PrimeiroAcesso } from '../components/PrimeiroAcesso';
import { UsuarioLogin } from '../components/UsuarioLogin';
import graficos from '../assets/graficos.png';
import pilhasLivros from '../assets/pilhasLivros.webp';

export function LoginPage() {
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
        <ButtonDestaque type="button">Baixe o app</ButtonDestaque>
        <img className="destaque-books" src={pilhasLivros} alt="" />
      </div>
    </div>
  );
}
