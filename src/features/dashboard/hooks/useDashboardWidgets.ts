import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardWidgetsService } from '../api/dashboardWidgetsService';
import { widgetsIndicadores } from '../components/registroWidgetsIndicadores';
import { reconcileWidgets } from '../model/widgetConfiguration';
import type { DashboardWidgetsDTO } from '../model/widgetTypes';

const queryKey = ['dashboard', 'widget-configuration'];
const registeredIds = widgetsIndicadores.map(({ id }) => id);
const reconcile = (configuration: DashboardWidgetsDTO) =>
  reconcileWidgets(configuration, registeredIds);

export function useDashboardWidgets() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: () => dashboardWidgetsService.get(),
    select: reconcile,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (configuration: DashboardWidgetsDTO) => dashboardWidgetsService.put(configuration),
    onSuccess: (_, configuration) => queryClient.setQueryData(queryKey, configuration),
  });
  return { query, mutation };
}
