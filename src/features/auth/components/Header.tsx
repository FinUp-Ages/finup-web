import finupLogo from '@/shared/assets/finUp-logo.png';

export function Header() {
  return (
    <header className="flex items-center gap-6 text-navy">
      <img src={finupLogo} alt="Logo da FinUp" className="h-[55px] w-auto shrink-0" />

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium leading-[26px]">Boas-vindas ao painel da FinUp!</h1>
        <p className="text-base leading-[21px]">Entre na sua conta</p>
      </div>
    </header>
  );
}
