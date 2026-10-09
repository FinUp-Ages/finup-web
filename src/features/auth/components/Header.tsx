import finupLogo from '@/shared/assets/finUp-logo.png';

export function Header() {
  return (
    <header className="flex items-start gap-6 bg-white p-6">
      <img src={finupLogo} alt="Logo da FinUp" className="h-20 w-auto" />

      <div>
        <h1 className="text-lg font-bold text-navy">Boas-vindas ao painel da FinUp!</h1>

        <p className="mt-2 text-navy">Entre na sua conta</p>
      </div>
    </header>
  );
}
