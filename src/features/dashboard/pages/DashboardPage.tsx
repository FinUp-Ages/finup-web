/**
 * Tela de Custos do painel (rota "/app/costs"), renderizada dentro do AdminLayout.
 *
 * Exibe os widgets de indicador (Receita bruta, Usuarios ativos e Custo operacional) e o card
 * de crescimento do usuario (GET /api/v1/admin/metrics/summary e user-growth, contrato C3).
 * Com VITE_USE_MOCKS=true os dados vem do mock da feature, sem chamar o backend.
 * Receita e custo sao sempre mock (fora do contrato).
 */
import { useState } from 'react';
import {
  GraficoCrescimentoUsuario,
  type OpcaoPeriodo,
} from '../components/GraficoCrescimentoUsuario';
import { widgetsIndicadores } from '../components/registroWidgetsIndicadores';
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
    <div className="flex items-start justify-center">
      <div className="flex w-full max-w-[948px] flex-col gap-6">
        <div className="flex flex-wrap gap-6">
          {widgetsIndicadores.map(({ id, Componente }) => (
            <Componente key={id} />
          ))}
        </div>
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
    </div>
  );
}
