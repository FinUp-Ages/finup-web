/**
 * Hooks de dados dos widgets de indicador (Receita bruta, Usuários ativos e Custo operacional).
 *
 * Envolvem as chamadas de API no TanStack Query, mantem loading/erro/dado
 * e entregam o dado ja no formato que a tela exibe. Nunca importam nem retornam JSX.
 */
import { useQuery } from '@tanstack/react-query';
import { getFinancialMetrics } from '../api/getFinancialMetrics';
import { getMetricsSummary } from '../api/getMetricsSummary';
import type { Indicador, MetricValueDTO, MetricsPeriod, Tendencia } from '../types';

/** "em relação ao mês anterior" do Figma: compara os ultimos 30 dias com os 30 anteriores. */
const PERIODO_INDICADORES: MetricsPeriod = '30d';

const formatoNumero = new Intl.NumberFormat('pt-BR');
const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoVariacao = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

function toTendencia(changePct: number): Tendencia {
  if (changePct > 0) {
    return 'alta';
  }
  return changePct < 0 ? 'baixa' : 'estavel';
}

/** { value: 320, changePct: 6 } -> { valor: "320", variacao: "+6%", tendencia: "alta" }. */
function toIndicador(dto: MetricValueDTO, formato: Intl.NumberFormat): Indicador {
  return {
    valor: formato.format(dto.value),
    variacao: `${formatoVariacao.format(dto.changePct)}%`,
    tendencia: toTendencia(dto.changePct),
  };
}

function toResultado<T>(
  query: { data: T | undefined; isPending: boolean; isError: boolean; refetch: () => unknown },
  mensagemErro: string,
) {
  return {
    dados: query.data ?? null,
    isLoading: query.isPending,
    errorMessage: query.isError ? mensagemErro : null,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useUsuariosAtivos() {
  const query = useQuery({
    queryKey: ['dashboard', 'metrics-summary', PERIODO_INDICADORES],
    queryFn: () => getMetricsSummary(PERIODO_INDICADORES),
    select: (dto) => toIndicador(dto.activeUsers, formatoNumero),
  });

  // TODO: implementar em tarefa futura — usar a mensagem normalizada pelo httpClient.
  return toResultado(query, 'Não foi possível carregar os usuários ativos.');
}

/** MOCK: receita e custo nao tem endpoint (ver api/getFinancialMetrics.ts). */
export function useReceita() {
  const query = useQuery({
    queryKey: ['dashboard', 'financial-metrics'],
    queryFn: getFinancialMetrics,
    select: (dto) => toIndicador(dto.revenue, formatoMoeda),
  });

  return toResultado(query, 'Não foi possível carregar a receita.');
}

/** MOCK: receita e custo nao tem endpoint (ver api/getFinancialMetrics.ts). */
export function useCustoOperacional() {
  const query = useQuery({
    queryKey: ['dashboard', 'financial-metrics'],
    queryFn: getFinancialMetrics,
    select: (dto) => toIndicador(dto.operationalCost, formatoMoeda),
  });

  return toResultado(query, 'Não foi possível carregar o custo operacional.');
}
