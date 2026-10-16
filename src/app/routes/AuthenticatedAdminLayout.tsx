/**
 * Layout administrativo com o usuario da sessao: nome vindo de GET /api/v1/admin/me e o
 * botao Sair na sidebar. Fica em app/ porque junta a feature auth ao layout de shared/.
 */
import { useAuth } from '@/features/auth';
import type { SidebarGroup } from '@/shared/components/common/Sidebar';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
// O contrato C2 nao traz foto: o avatar do Figma fica como imagem padrao.
import avatar from '@/shared/assets/sidebar/avatar.png';

type AuthenticatedAdminLayoutProps = {
  navigation: SidebarGroup[];
};

export function AuthenticatedAdminLayout({ navigation }: AuthenticatedAdminLayoutProps) {
  const { state, signOut } = useAuth();

  // O ProtectedRoute so renderiza este layout com sessao autenticada.
  if (state.status !== 'authenticated') {
    return null;
  }

  return (
    <AdminLayout
      navigation={navigation}
      user={{ name: state.admin.name, role: 'Pessoa administradora', avatar }}
      onLogout={() => void signOut()}
    />
  );
}
