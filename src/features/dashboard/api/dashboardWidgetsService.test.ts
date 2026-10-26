import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DASHBOARD_WIDGETS_ENDPOINT,
  DASHBOARD_WIDGETS_STORAGE_KEY,
  httpDashboardWidgetsService,
  localDashboardWidgetsService,
} from './dashboardWidgetsService';
import { httpClient } from '@/shared/config/httpClient';
import { parseDashboardWidgets, reconcileWidgets } from '../model/widgetConfiguration';

const configuration = {
  widgets: [
    { id: 'NEW_CLIENTS', enabled: false, position: 0 },
    { id: 'ACTIVE_USERS', enabled: true, position: 1 },
  ],
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('C5 local e HTTP', () => {
  it('persiste o payload C5 e rele do armazenamento sem estado em memoria', async () => {
    expect(await localDashboardWidgetsService.get()).toEqual({ widgets: [] });
    await localDashboardWidgetsService.put(configuration);
    expect(JSON.parse(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)!)).toEqual(configuration);
    expect(await localDashboardWidgetsService.get()).toEqual(configuration);
  });

  it('nao sobrescreve dados corrompidos e propaga falhas de armazenamento', async () => {
    localStorage.setItem(DASHBOARD_WIDGETS_STORAGE_KEY, '{invalido');
    await expect(localDashboardWidgetsService.get()).rejects.toThrow();
    expect(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)).toBe('{invalido');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    await expect(localDashboardWidgetsService.put(configuration)).rejects.toThrow('quota');
  });

  it('usa GET e PUT na rota do C5 com o mesmo payload', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: configuration });
    const put = vi.spyOn(httpClient, 'put').mockResolvedValue({ status: 204 });
    expect(await httpDashboardWidgetsService.get()).toEqual(configuration);
    await httpDashboardWidgetsService.put(configuration);
    expect(get).toHaveBeenCalledWith(DASHBOARD_WIDGETS_ENDPOINT);
    expect(put).toHaveBeenCalledWith(DASHBOARD_WIDGETS_ENDPOINT, configuration);
  });

  it('reconcilia novos registros sem perder preferencia ou IDs desconhecidos', () => {
    const saved = {
      widgets: [
        { id: 'FUTURE', enabled: false, position: 8 },
        { id: 'ACTIVE_USERS', enabled: false, position: 2 },
      ],
    };
    expect(reconcileWidgets(saved, ['ACTIVE_USERS', 'NEW_CLIENTS']).widgets).toEqual([
      { id: 'ACTIVE_USERS', enabled: false, position: 0 },
      { id: 'FUTURE', enabled: false, position: 1 },
      { id: 'NEW_CLIENTS', enabled: true, position: 2 },
    ]);
  });

  it.each([
    null,
    {},
    { widgets: [{}] },
    { widgets: [{ id: 'A', enabled: true, position: -1 }] },
    { widgets: [{ id: 'A', enabled: true, position: 0.5 }] },
    { widgets: [{ id: 'A', enabled: 'true', position: 0 }] },
    {
      widgets: [
        { id: 'A', enabled: true, position: 0 },
        { id: 'A', enabled: false, position: 1 },
      ],
    },
  ])('rejeita configuracao invalida: %j', (value) => {
    expect(() => parseDashboardWidgets(value)).toThrow();
  });
});
