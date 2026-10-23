/**
 * Widgets de indicador do dashboard, cada um com os proprios dados.
 * Receita bruta e Custo operacional sao MOCK (fora do contrato C3).
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MetricsPeriod } from '../types';
import {
  useCustoOperacional,
  useReceita,
  useUsuariosAtivos,
  useClientesNovos,
} from '../hooks/useIndicadores';
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

export function WidgetClientesNovos() {
  const [period, setPeriod] = useState<MetricsPeriod>('30d');
  const { dados, isLoading, errorMessage, reload } = useClientesNovos(period);
  return (
    <WidgetIndicador
      titulo="Clientes novos"
      textoComparacao="em relação ao período anterior."
      filtro={
        <div className="relative shrink-0">
          <select
            aria-label="Período de clientes novos"
            value={period}
            onChange={(event) => setPeriod(event.target.value as MetricsPeriod)}
            className="h-7 cursor-pointer appearance-none rounded-md border border-navy/10 bg-chart-surface py-1 pl-2 pr-6 text-[11px] font-medium text-navy transition-colors hover:border-navy/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
          </select>
          <ChevronDown
            size={12}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-navy/60"
          />
        </div>
      }
      dados={dados}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onTentarNovamente={reload}
    />
  );
}
