import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMetricsSummary } from './getMetricsSummary';
import { getMetricsSummaryMock } from './metricsSummaryMock';
import { httpClient } from '@/shared/config/httpClient';

const config = vi.hoisted(() => ({ useMocks: true }));
vi.mock('@/shared/config/env', () => ({ env: config }));
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Summary C3: flag mock/real', () => {
  it.each(['7d', '30d', '90d'] as const)(
    'retorna mock C3 de %s sem chamar HTTP',
    async (period) => {
      config.useMocks = true;
      const get = vi.spyOn(httpClient, 'get');
      expect(await getMetricsSummary(period)).toEqual(getMetricsSummaryMock(period));
      expect(get).not.toHaveBeenCalled();
    },
  );

  it.each(['7d', '30d', '90d'] as const)(
    'com flag desligada envia %s para o endpoint real',
    async (period) => {
      config.useMocks = false;
      const data = getMetricsSummaryMock(period);
      const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data });
      expect(await getMetricsSummary(period)).toEqual(data);
      expect(get).toHaveBeenCalledWith('/api/v1/admin/metrics/summary', { params: { period } });
    },
  );

  it('propaga falha HTTP sem substituir silenciosamente por mock', async () => {
    config.useMocks = false;
    vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('offline'));
    await expect(getMetricsSummary('30d')).rejects.toThrow('offline');
  });
});
