/**
 * Layout administrativo: sidebar fixa a esquerda e a page da rota filha no <main>.
 * Unico <main> das telas sob /app; as pages renderizam so o proprio conteudo.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar, type SidebarGroup, type SidebarUser } from '@/shared/components/common/Sidebar';

type AdminLayoutProps = {
  navigation: SidebarGroup[];
  user: SidebarUser;
  onLogout?: () => void;
};

export function AdminLayout({ navigation, user, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar groups={navigation} user={user} onLogout={onLogout} />
      <main className="min-w-0 flex-1 bg-surface-light p-10 font-inter">
        <Outlet />
      </main>
    </div>
  );
}
