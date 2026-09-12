import Header from '@/shared/components/common/Header';
import HeaderDuolingo from '@/shared/components/common/HeaderDuolingo';
import PrimeiroAcesso from '@/shared/components/common/PrimeiroAcesso';
import UsuarioLogin from '@/shared/components/common/UsuarioLogin';
import ButtonDuolingo from '@/shared/components/ui/ButtonDuolingo';
import graficos from '@/assets/graficos.png';
import pilhasLivros from '@/assets/pilhasLivros.png';

export function WelcomePage() {
  return (
    <div className="auth-page">
      <main className="auth-panel">
        <Header />
        <UsuarioLogin />
        <PrimeiroAcesso />
      </main>

      <div className="auth-panel-duolingo">
        <img className="duolingo-graphs" src={graficos} alt="" />
        <HeaderDuolingo />
        <ButtonDuolingo type="submit">Baixe o app</ButtonDuolingo>
        <img className="duolingo-books" src={pilhasLivros} alt="" />
      </div>
    </div>
  );
}
