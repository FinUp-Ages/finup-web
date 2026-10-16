/**
 * Itens da sidebar do layout administrativo e usuario exibido no rodape.
 * Mantido fora da arvore de rotas para que index.tsx so mapeie caminho -> page.
 */
import { paths } from '@/app/routes/paths';
import avatar from '@/shared/assets/sidebar/avatar.png';
import teamIcon from '@/shared/assets/sidebar/team.png';
import analyticsIcon from '@/shared/assets/sidebar/analytics.png';
import costsIcon from '@/shared/assets/sidebar/costs.png';
import studiesIcon from '@/shared/assets/sidebar/studies.png';
import type { SidebarGroup, SidebarUser } from '@/shared/components/common/Sidebar';

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

// TODO: implementar em tarefa futura — trocar pelo perfil do usuario autenticado.
// A autenticacao ainda nao fornece perfil ao frontend. Estes dados ilustram o layout do Figma.
export const previewUser: SidebarUser = {
  name: 'Carlos José',
  role: 'Head de tecnologia',
  avatar,
};
