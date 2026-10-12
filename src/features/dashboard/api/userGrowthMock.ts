/**
 * Resposta simulada de GET /api/v1/admin/metrics/user-growth (contrato C3).
 * Usada quando VITE_USE_MOCKS=true, enquanto o endpoint do finup-backend nao existe.
 */
import type { UserGrowthDTO } from '../types';

/** Ultimos 12 meses; nos 6 ultimos o crescimento e de 278%, como no exemplo do contrato. */
const pontosMock: UserGrowthDTO['points'] = [
  { month: '2025-08', newUsers: 8, totalUsers: 40 },
  { month: '2025-09', newUsers: 12, totalUsers: 52 },
  { month: '2025-10', newUsers: 9, totalUsers: 61 },
  { month: '2025-11', newUsers: 9, totalUsers: 70 },
  { month: '2025-12', newUsers: 14, totalUsers: 84 },
  { month: '2026-01', newUsers: 8, totalUsers: 92 },
  { month: '2026-02', newUsers: 8, totalUsers: 100 },
  { month: '2026-03', newUsers: 40, totalUsers: 140 },
  { month: '2026-04', newUsers: 45, totalUsers: 185 },
  { month: '2026-05', newUsers: 55, totalUsers: 240 },
  { month: '2026-06', newUsers: 60, totalUsers: 300 },
  { month: '2026-07', newUsers: 78, totalUsers: 378 },
];

export function getUserGrowthMock(months: number): UserGrowthDTO {
  const points = pontosMock.slice(Math.max(pontosMock.length - months, 0));
  const primeiro = points[0]?.totalUsers ?? 0;
  const ultimo = points[points.length - 1]?.totalUsers ?? 0;
  const growthPct = primeiro > 0 ? Math.round(((ultimo - primeiro) / primeiro) * 1000) / 10 : 0;

  return { growthPct, points };
}
