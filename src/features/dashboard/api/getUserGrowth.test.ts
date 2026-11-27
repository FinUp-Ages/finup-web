import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/config/httpClient';
import { getUserGrowth } from './getUserGrowth';
import { getUserGrowthMock } from './userGrowthMock';

const config = vi.hoisted(() => ({ useMocks: true }));
vi.mock('@/shared/config/env', () => ({ env: config }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('User growth C3: flag mock/real', () => {
  it('com mocks, devolve os ultimos meses pedidos sem chamar HTTP', async () => {
    config.useMocks = true;
    const get = vi.spyOn(httpClient, 'get');

    const growth = await getUserGrowth(6);

    expect(growth.points).toHaveLength(6);
    expect(growth.points[0].month).toBe('2026-02');
    expect(growth.growthPct).toBe(278);
    expect(get).not.toHaveBeenCalled();
  });

  it('com a flag desligada, chama o endpoint real com os meses', async () => {
    config.useMocks = false;
    const data = getUserGrowthMock(3);
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data });

    expect(await getUserGrowth(3)).toEqual(data);
    expect(get).toHaveBeenCalledWith('/api/v1/admin/metrics/user-growth', {
      params: { months: 3 },
    });
  });

  it('propaga falha HTTP sem trocar por mock', async () => {
    config.useMocks = false;
    vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('offline'));
    await expect(getUserGrowth(6)).rejects.toThrow('offline');
  });
});

describe('getUserGrowthMock', () => {
  it('limita ao historico disponivel', () => {
    expect(getUserGrowthMock(24).points).toHaveLength(12);
  });

  it('sem pontos, o crescimento e zero', () => {
    expect(getUserGrowthMock(0)).toEqual({ growthPct: 0, points: [] });
  });
});
