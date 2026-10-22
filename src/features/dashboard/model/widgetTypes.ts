/** Contrato C5: GET/PUT /api/v1/admin/dashboard/widgets. */
export interface DashboardWidgetDTO {
  id: string;
  enabled: boolean;
  position: number;
}

export interface DashboardWidgetsDTO {
  widgets: DashboardWidgetDTO[];
}
