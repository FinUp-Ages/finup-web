import Header from '@/shared/components/common/Header';
import PrimeiroAcesso from '@/shared/components/common/PrimeiroAcesso';
import UsuarioLogin from '@/shared/components/common/UsuarioLogin';

export function WelcomePage() {
  return (
    <main className="auth-panel">
      <Header />
      <UsuarioLogin />
      <PrimeiroAcesso />
    </main>
  );
}
