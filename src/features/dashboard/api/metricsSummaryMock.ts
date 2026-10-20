/**
 * Resposta simulada de GET /api/v1/admin/metrics/summary (contrato C3).
 * Usada quando VITE_USE_MOCKS=true; os valores sao os do exemplo do contrato.
 */
import type { MetricsSummaryDTO } from '../types';

export function getMetricsSummaryMock(): MetricsSummaryDTO {
  return {
    activeUsers: { value: 320, previousValue: 302, changePct: 6.0 },
    newUsers: { value: 12, previousValue: 12.5, changePct: -4.0 },
  };
}
