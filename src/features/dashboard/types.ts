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
