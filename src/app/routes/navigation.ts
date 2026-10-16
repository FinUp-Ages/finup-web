/**
 * Itens da sidebar do layout administrativo.
 * Mantido fora da arvore de rotas para que index.tsx so mapeie caminho -> page.
 */
import { paths } from '@/app/routes/paths';
import teamIcon from '@/shared/assets/sidebar/team.png';
import analyticsIcon from '@/shared/assets/sidebar/analytics.png';
import costsIcon from '@/shared/assets/sidebar/costs.png';
import studiesIcon from '@/shared/assets/sidebar/studies.png';
import type { SidebarGroup } from '@/shared/components/common/Sidebar';

export const navigation: SidebarGroup[] = [
  { label: 'Pessoas', links: [{ label: 'Seu time', to: paths.team, icon: teamIcon }] },
  {
    label: 'Aplicativo',
    links: [
      { label: 'Analytics', to: paths.analytics, icon: analyticsIcon },
      { label: 'Custos', to: paths.costs, icon: costsIcon },
      { label: 'Trilha de estudos', to: paths.studies, icon: studiesIcon },
    ],
  },
];

