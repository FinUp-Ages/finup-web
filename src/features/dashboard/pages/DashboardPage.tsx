/**
 * Tela inicial do painel (rota "/dashboard").
 *
 * Exibe o card de crescimento do usuario (GET /api/v1/admin/metrics/user-growth, contrato C3).
 * Com VITE_USE_MOCKS=true os dados vem do mock da feature, sem chamar o backend.
 */
import { useState } from 'react';
import {
  GraficoCrescimentoUsuario,
  type OpcaoPeriodo,
} from '../components/GraficoCrescimentoUsuario';
import { useUserGrowth } from '../hooks/useUserGrowth';

const opcoesPeriodo: OpcaoPeriodo[] = [{ meses: 6, rotulo: 'Últimos 6 meses' }];

export function DashboardPage() {
  const [periodo, setPeriodo] = useState(opcoesPeriodo[0].meses);
  const { dados, isLoading, errorMessage, reload } = useUserGrowth(periodo);

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-100 p-6">
      <div className="w-full max-w-[948px]">
        <GraficoCrescimentoUsuario
          dados={dados}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onTentarNovamente={reload}
          periodo={periodo}
          opcoesPeriodo={opcoesPeriodo}
          onPeriodoChange={setPeriodo}
        />
      </div>
    </main>
  );
}
