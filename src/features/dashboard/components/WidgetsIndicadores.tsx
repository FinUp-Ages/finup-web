/**
 * Widgets de indicador do dashboard, cada um com os proprios dados.
 * Receita bruta e Custo operacional sao MOCK (fora do contrato C3).
 */
import { useCustoOperacional, useReceita, useUsuariosAtivos } from '../hooks/useIndicadores';
import { WidgetIndicador } from './WidgetIndicador';

/** MOCK: sem endpoint de receita (ver api/getFinancialMetrics.ts). */
export function WidgetReceita() {
  const { dados, isLoading, errorMessage, reload } = useReceita();

  return (
    <WidgetIndicador
      titulo="Receita bruta"
      dados={dados}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onTentarNovamente={reload}
    />
  );
}

/** activeUsers de GET /api/v1/admin/metrics/summary (contrato C3). */
export function WidgetUsuariosAtivos() {
  const { dados, isLoading, errorMessage, reload } = useUsuariosAtivos();

  return (
    <WidgetIndicador
      titulo="Usuários ativos"
      dados={dados}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onTentarNovamente={reload}
    />
  );
}

/** MOCK: sem endpoint de custo (ver api/getFinancialMetrics.ts). Alta de custo e desfavoravel. */
export function WidgetCustoOperacional() {
  const { dados, isLoading, errorMessage, reload } = useCustoOperacional();

  return (
    <WidgetIndicador
      titulo="Custo operacional"
      dados={dados}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onTentarNovamente={reload}
      altaEhFavoravel={false}
    />
  );
}
