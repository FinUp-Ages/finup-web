import type { ComponentType } from 'react';
import {
  WidgetCustoOperacional,
  WidgetReceita,
  WidgetUsuariosAtivos,
  WidgetClientesNovos,
} from './WidgetsIndicadores';
import { WidgetCrescimentoUsuario } from './WidgetCrescimentoUsuario';

export type WidgetIndicadorRegistrado = {
  id: string;
  titulo: string;
  largura: 'indicador' | 'completa';
  Componente: ComponentType;
};

/** Para adicionar um widget, registre aqui seu ID C5, titulo, largura e componente. */
export const widgetsIndicadores: WidgetIndicadorRegistrado[] = [
  { id: 'REVENUE', titulo: 'Receita bruta', largura: 'indicador', Componente: WidgetReceita },
  {
    id: 'ACTIVE_USERS',
    titulo: 'Usuários ativos',
    largura: 'indicador',
    Componente: WidgetUsuariosAtivos,
  },
  {
    id: 'NEW_CLIENTS',
    titulo: 'Clientes novos',
    largura: 'indicador',
    Componente: WidgetClientesNovos,
  },
  {
    id: 'OPERATIONAL_COST',
    titulo: 'Custo operacional',
    largura: 'indicador',
    Componente: WidgetCustoOperacional,
  },
  {
    id: 'USER_GROWTH',
    titulo: 'Crescimento do usuário',
    largura: 'completa',
    Componente: WidgetCrescimentoUsuario,
  },
];
