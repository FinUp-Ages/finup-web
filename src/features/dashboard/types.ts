/**
 * Tipos da feature "dashboard".
 * Tipos usados por mais de uma feature vao para shared/types/.
 */

/** Um mes da serie de GET /api/v1/admin/metrics/user-growth (contrato C3). */
export interface UserGrowthPointDTO {
  /** Mes no formato "AAAA-MM". */
  month: string;
  newUsers: number;
  totalUsers: number;
}

/** Formato bruto devolvido por GET /api/v1/admin/metrics/user-growth (contrato C3). */
export interface UserGrowthDTO {
  growthPct: number;
  points: UserGrowthPointDTO[];
}

/** Ponto pronto para exibicao no grafico. */
export interface PontoCrescimento {
  /** Mes no formato "AAAA-MM", unico na serie. */
  mes: string;
  rotulo: string;
  totalUsuarios: number;
  novosUsuarios: number;
}

/** Dados prontos para o card "Crescimento do usuário" — a tela nao conhece o DTO. */
export interface CrescimentoUsuario {
  crescimento: string;
  pontos: PontoCrescimento[];
  /** Topo do eixo Y; o eixo comeca em zero. */
  valorMaximo: number;
  /** Rotulos do eixo Y, do topo para a base. */
  rotulosEixoY: string[];
}

/** Valor de um indicador e o do periodo anterior de mesmo tamanho (contrato C3). */
export interface MetricValueDTO {
  value: number;
  previousValue: number;
  /** Variacao em %, com 1 casa decimal (ex.: 6.0, -4.0). */
  changePct: number;
}

/** Periodos aceitos por GET /api/v1/admin/metrics/summary. */
export type MetricsPeriod = '7d' | '30d' | '90d';

/** Formato bruto devolvido por GET /api/v1/admin/metrics/summary (contrato C3). */
export interface MetricsSummaryDTO {
  activeUsers: MetricValueDTO;
  newUsers: MetricValueDTO;
}

/**
 * MOCK: Receita e Custo operacional estao fora do contrato C3 e nao tem endpoint.
 * Mesmo formato dos indicadores do C3 para trocar pelo back sem mudar a tela.
 */
export interface FinancialMetricsDTO {
  revenue: MetricValueDTO;
  operationalCost: MetricValueDTO;
}

/** alta/baixa do valor; estavel quando a variacao e zero. */
export type Tendencia = 'alta' | 'baixa' | 'estavel';

/** Dados prontos para um widget de indicador — a tela nao conhece o DTO. */
export interface Indicador {
  valor: string;
  /** Ex.: "+6%", "-4%", "0%". */
  variacao: string;
  tendencia: Tendencia;
}
