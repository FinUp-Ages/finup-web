/**
 * Tela de boas-vindas (rota "/"), ponto de partida para os desenvolvedores.
 *
 * Tela estatica: nao exibe dado da API, por isso a feature nao tem api/ nem hooks/.
 * Quando uma tela precisar de dados, siga a feature de referencia: features/example/.
 *
 * O logotipo em texto e branco com fundo transparente: so aparece sobre fundo escuro.
 */
import finupIcon from '@/shared/assets/finup-logo-icon.png';
import finupTextLogo from '@/shared/assets/finup-logo-text.png';

export function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-900 p-6 text-center">
      {/* O PNG do icone tem margem transparente (padrao de icone Android); a margem negativa compensa. */}
      <img src={finupIcon} alt="" className="-my-12 h-44 w-44" />
      <img src={finupTextLogo} alt="FinUp" className="h-14 w-auto" />
      <p className="text-lg text-slate-300">Painel administrativo</p>
      <p className="text-sm text-slate-400">
        Edite{' '}
        <code className="break-all rounded bg-slate-800 px-1 py-0.5 text-slate-200">
          src/features/welcome/pages/WelcomePage.tsx
        </code>{' '}
        para começar.
      </p>
    </main>
  );
}
