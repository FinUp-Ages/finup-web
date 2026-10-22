import type { DashboardWidgetsDTO } from './widgetTypes';

/** Valida dados externos antes de usa-los; IDs desconhecidos sao preservados. */
export function parseDashboardWidgets(value: unknown): DashboardWidgetsDTO {
  if (
    !value ||
    typeof value !== 'object' ||
    !('widgets' in value) ||
    !Array.isArray(value.widgets)
  ) {
    throw new Error('Configuração de widgets inválida.');
  }
  const ids = new Set<string>();
  const widgets = value.widgets.map((item: unknown) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('id' in item) ||
      typeof item.id !== 'string' ||
      !item.id.trim() ||
      ids.has(item.id) ||
      !('enabled' in item) ||
      typeof item.enabled !== 'boolean' ||
      !('position' in item) ||
      typeof item.position !== 'number' ||
      !Number.isSafeInteger(item.position) ||
      item.position < 0
    ) {
      throw new Error('Configuração de widgets inválida.');
    }
    ids.add(item.id);
    return { id: item.id, enabled: item.enabled, position: item.position };
  });
  return { widgets };
}

/** Preserva preferencias salvas e acrescenta novos registros ao final. */
export function reconcileWidgets(
  saved: DashboardWidgetsDTO,
  registeredIds: readonly string[],
): DashboardWidgetsDTO {
  const widgets = [...saved.widgets].sort((a, b) => a.position - b.position);
  const known = new Set(widgets.map(({ id }) => id));
  for (const id of registeredIds) {
    if (!known.has(id)) widgets.push({ id, enabled: true, position: widgets.length });
  }
  return { widgets: widgets.map((widget, position) => ({ ...widget, position })) };
}
