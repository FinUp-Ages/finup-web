import finupLogo from '../../../assets/finUp-logo.png';

function Header() {
  return (
    <header className="auth-header flex items-start gap-6 bg-white p-6">
      <img src={finupLogo} alt="Logo da FinUp" className="h-20 w-auto" />

      <div>
        <h1 className="auth-title text-lg font-bold text-[rgba(2,23,54,1)]">
          Boas-vindas ao painel da FinUp!
        </h1>

        <p className="mt-2 text-[rgba(2,23,54,1)]">Entre na sua conta</p>
      </div>
    </header>
  );
}

export default Header;
