import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import { parseDashboardWidgets } from '../model/widgetConfiguration';
import type { DashboardWidgetsDTO } from '../model/widgetTypes';

export const DASHBOARD_WIDGETS_STORAGE_KEY = 'finup:admin:dashboard:widgets';
export const DASHBOARD_WIDGETS_ENDPOINT = '/api/v1/admin/dashboard/widgets';

export interface DashboardWidgetsService {
  get: () => Promise<DashboardWidgetsDTO>;
  put: (configuration: DashboardWidgetsDTO) => Promise<void>;
}

export const localDashboardWidgetsService: DashboardWidgetsService = {
  async get() {
    const stored = localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY);
    return stored === null ? { widgets: [] } : parseDashboardWidgets(JSON.parse(stored));
  },
  async put(configuration) {
    localStorage.setItem(
      DASHBOARD_WIDGETS_STORAGE_KEY,
      JSON.stringify(parseDashboardWidgets(configuration)),
    );
  },
};

export const httpDashboardWidgetsService: DashboardWidgetsService = {
  async get() {
    const { data } = await httpClient.get<unknown>(DASHBOARD_WIDGETS_ENDPOINT);
    return parseDashboardWidgets(data);
  },
  async put(configuration) {
    await httpClient.put(DASHBOARD_WIDGETS_ENDPOINT, parseDashboardWidgets(configuration));
  },
};

/** A UI e o hook dependem apenas desta interface; transporte e escolhido aqui. */
export const dashboardWidgetsService = env.dashboardWidgetsApi
  ? httpDashboardWidgetsService
  : localDashboardWidgetsService;
