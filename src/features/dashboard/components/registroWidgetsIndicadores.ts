/**
 * Widgets de indicador por id do contrato C5 (GET/PUT /api/v1/admin/dashboard/widgets),
 * na ordem do Figma. A estrutura de widgets configuraveis usa o id para ligar,
 * desligar e ordenar cada um.
 */
import type { ComponentType } from 'react';
import { WidgetCustoOperacional, WidgetReceita, WidgetUsuariosAtivos } from './WidgetsIndicadores';

export type WidgetIndicadorRegistrado = {
  id: string;
  Componente: ComponentType;
};

export const widgetsIndicadores: WidgetIndicadorRegistrado[] = [
  { id: 'REVENUE', Componente: WidgetReceita },
  { id: 'ACTIVE_USERS', Componente: WidgetUsuariosAtivos },
  { id: 'OPERATIONAL_COST', Componente: WidgetCustoOperacional },
];
