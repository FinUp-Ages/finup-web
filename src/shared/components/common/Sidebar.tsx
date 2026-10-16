/**
 * Sidebar do layout administrativo (Figma: no 191-2352).
 * Grupos de links por rota com o item ativo destacado e o usuario no rodape.
 */
import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '@/shared/assets/sidebar/logo.svg';

export type SidebarLink = {
  label: string;
  to: string;
  icon: string;
};

export type SidebarGroup = {
  label: string;
  links: SidebarLink[];
};

export type SidebarUser = {
  name: string;
  role: string;
  avatar: string;
};

type SidebarProps = {
  groups: SidebarGroup[];
  user: SidebarUser;
  /** Mostra o botao Sair abaixo do usuario. */
  onLogout?: () => void;
};

export function Sidebar({ groups, user, onLogout }: SidebarProps) {
  return (
    <aside className="flex min-h-screen w-[332px] shrink-0 flex-col bg-navy px-6 pb-6 pt-[60px] font-inter text-on-navy">
      <img src={logo} alt="FinUp" className="h-[43px] w-auto shrink-0 self-start" />

      <nav aria-label="Navegação principal" className="mt-10 flex flex-col gap-6">
        {groups.map((group, index) => (
          <div key={group.label} className="flex flex-col gap-4">
            {index > 0 && <hr className="mb-2 border-0 border-t-2 border-white/10" />}
            <p className="text-sm font-normal">{group.label}</p>
            <div className="flex flex-col">
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex h-[50px] items-center gap-[10px] border-l px-5 text-sm text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                      isActive
                        ? 'border-white bg-gradient-to-r from-white/10 to-white/[0.02]'
                        : 'border-transparent hover:bg-white/[0.06]'
                    }`
                  }
                >
                  <img src={link.icon} alt="" className="shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 pt-10">
        <img
          src={user.avatar}
          alt=""
          className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-xs font-medium tracking-[0.24px]">{user.role}</span>
          <span className="truncate text-sm font-semibold tracking-[0.28px]">{user.name}</span>
        </div>
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex h-[50px] cursor-pointer items-center gap-[10px] rounded-md px-5 text-sm text-white outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        >
          <LogOut aria-hidden="true" size={18} />
          <span>Sair</span>
        </button>
      )}
    </aside>
  );
}
