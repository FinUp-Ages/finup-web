/**
 * MOCK: dados dos widgets "Receita bruta" e "Custo operacional".
 *
 * Receita e custo ficam fora do contrato C3 e ainda nao tem endpoint no finup-backend,
 * entao a funcao sempre devolve o mock, com ou sem VITE_USE_MOCKS. Quando o endpoint
 * existir, a chamada ao httpClient entra aqui sem mudar hook nem tela.
 */
import type { FinancialMetricsDTO } from '../types';

/** MOCK: valores do Figma (nó 191-2603). */
const financialMetricsMock: FinancialMetricsDTO = {
  revenue: { value: 9876.45, previousValue: 9317.41, changePct: 6.0 },
  operationalCost: { value: 23456.45, previousValue: 22128.73, changePct: 6.0 },
};

export async function getFinancialMetrics(): Promise<FinancialMetricsDTO> {
  return financialMetricsMock;
}
