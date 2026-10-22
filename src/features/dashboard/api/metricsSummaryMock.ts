/** Respostas simuladas do summary C3, selecionadas pela mesma flag do servico HTTP. */
import type { MetricsPeriod, MetricsSummaryDTO } from '../types';

export function getMetricsSummaryMock(period: MetricsPeriod = '30d'): MetricsSummaryDTO {
  switch (period) {
    case '7d':
      return {
        activeUsers: { value: 100, previousValue: 100, changePct: 0 },
        newUsers: { value: 4, previousValue: 4, changePct: 0 },
      };
    case '90d':
      return {
        activeUsers: { value: 640, previousValue: 600, changePct: 6.7 },
        newUsers: { value: 42, previousValue: 35, changePct: 20 },
      };
    case '30d':
      return {
        activeUsers: { value: 320, previousValue: 302, changePct: 6.0 },
        newUsers: { value: 12, previousValue: 12.5, changePct: -4.0 },
      };
  }
}
