/**
 * Resposta simulada de GET /api/v1/admin/metrics/user-growth (contrato C3).
 * Usada quando VITE_USE_MOCKS=true, enquanto o endpoint do finup-backend nao existe.
 */
import type { UserGrowthDTO } from '../types';

const pontosMock: UserGrowthDTO['points'] = [
  { month: '2026-02', newUsers: 18, totalUsers: 80 },
  { month: '2026-03', newUsers: 32, totalUsers: 112 },
  { month: '2026-04', newUsers: 38, totalUsers: 150 },
  { month: '2026-05', newUsers: 46, totalUsers: 196 },
  { month: '2026-06', newUsers: 52, totalUsers: 248 },
  { month: '2026-07', newUsers: 54, totalUsers: 302 },
];

export function getUserGrowthMock(months: number): UserGrowthDTO {
  return { growthPct: 278.0, points: pontosMock.slice(Math.max(pontosMock.length - months, 0)) };
}
