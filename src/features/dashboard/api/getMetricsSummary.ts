/**
 * Chamadas de API do widget "Usuários ativos" (contrato C3, summary).
 *
 * Unico ponto da feature que conhece a rota da API.
 * Sem hooks do React, sem estado, sem JSX e sem formatacao para exibicao.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { MetricsPeriod, MetricsSummaryDTO } from '../types';
import { getMetricsSummaryMock } from './metricsSummaryMock';

export async function getMetricsSummary(period: MetricsPeriod): Promise<MetricsSummaryDTO> {
  if (env.useMocks) {
    return getMetricsSummaryMock(period);
  }

  const { data } = await httpClient.get<MetricsSummaryDTO>('/api/v1/admin/metrics/summary', {
    params: { period },
  });
  return data;
}
