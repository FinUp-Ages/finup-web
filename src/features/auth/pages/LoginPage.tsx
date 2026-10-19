/**
 * Tela de login do painel (rota "/login").
 *
 * Com sessao valida, nao mostra o formulario: leva ao painel, ou de volta a pagina em que a
 * sessao expirou. O destino padrao vem das rotas (`redirectTo`), porque features/ nao
 * conhece os caminhos de app/.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { FullPageLoader } from '@/shared/components/ui/FullPageLoader';
import graficos from '@/shared/assets/graficos.png';
import pilhasLivros from '@/shared/assets/pilhasLivros.webp';
import { ButtonDestaque } from '../components/ButtonDestaque';
import { Header } from '../components/Header';
import { HeaderDestaque } from '../components/HeaderDestaque';
import { PrimeiroAcesso } from '../components/PrimeiroAcesso';
import { UsuarioLogin } from '../components/UsuarioLogin';
import { useAuth } from '../hooks/useAuth';
import { noticeMessages } from '../session/messages';

type LoginPageProps = {
  redirectTo: string;
};

export function LoginPage({ redirectTo }: LoginPageProps) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'loading') {
    return <FullPageLoader label="Conferindo sua sessão…" />;
  }

  if (state.status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen font-dm-sans">
      <main className="flex min-h-screen w-1/2 flex-col justify-center bg-white px-6 py-8">
        <div className="mx-auto flex w-full max-w-[402px] flex-col gap-6">
          <Header />
          <div className="flex flex-col gap-8">
            <UsuarioLogin aviso={state.notice ? noticeMessages[state.notice] : null} />
            <PrimeiroAcesso />
          </div>
        </div>
      </main>

      <div className="relative flex min-h-screen w-1/2 flex-col items-center overflow-hidden bg-[radial-gradient(100%_135.15%_at_0%_100%,#014B90_0%,#00162A_100%)] px-6 pb-6 pt-[clamp(120px,19.6vh,200px)]">
        <img
          className="pointer-events-none absolute right-0 bottom-0 h-[80%] w-full"
          src={graficos}
          alt=""
        />
        <div className="z-[2] flex w-full max-w-[352px] flex-col gap-[18px]">
          <HeaderDestaque />
          <ButtonDestaque type="button">Baixe o app</ButtonDestaque>
        </div>
        <img
          className="pointer-events-none absolute right-[-26%] bottom-[-25%] z-[1] w-[min(88%,540px)]"
          src={pilhasLivros}
          alt=""
        />
      </div>
    </div>
  );
}
