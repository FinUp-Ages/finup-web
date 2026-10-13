/**
 * Tela inicial do painel (rota "/app/dashboard").
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

const opcoesPeriodo: OpcaoPeriodo[] = [
  { meses: 3, rotulo: 'Últimos 3 meses' },
  { meses: 6, rotulo: 'Últimos 6 meses' },
  { meses: 12, rotulo: 'Últimos 12 meses' },
];

/** Padrao da tarefa e do Figma. */
const PERIODO_PADRAO = 6;

export function DashboardPage() {
  const [periodo, setPeriodo] = useState(PERIODO_PADRAO);
  const { dados, isLoading, errorMessage, reload } = useUserGrowth(periodo);

  return (
    <main className="flex min-h-screen items-start justify-center bg-surface-light p-6">
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
