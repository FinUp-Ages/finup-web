import { ButtonDestaque } from '../components/ButtonDestaque';
import { Header } from '../components/Header';
import { HeaderDestaque } from '../components/HeaderDestaque';
import { PrimeiroAcesso } from '../components/PrimeiroAcesso';
import { UsuarioLogin } from '../components/UsuarioLogin';
import graficos from '../../../shared/assets/graficos.png';
import pilhasLivros from '../../../shared/assets/pilhasLivros.webp';

export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <main className="flex min-h-screen w-1/2 flex-col items-center justify-center bg-white p-6">
        <Header />
        <UsuarioLogin />
        <PrimeiroAcesso />
      </main>

      <div className="relative flex min-h-screen w-1/2 flex-col items-center justify-start overflow-hidden bg-[linear-gradient(135deg,rgba(1,75,144,1),rgba(0,22,42,1))] px-6 pb-6 pt-[clamp(92px,17vh,148px)]">
        <img className="pointer-events-none absolute right-0 bottom-0 h-[80%] w-full" src={graficos} alt="" />
        <HeaderDestaque />
        <ButtonDestaque type="button">Baixe o app</ButtonDestaque>
        <img className="pointer-events-none absolute right-[-26%] bottom-[-25%] z-[1] w-[min(88%,540px)]" src={pilhasLivros} alt="" />
      </div>
    </div>
  );
}
