import type { UserDTO } from '../types';

interface UsersTableProps {
  users: UserDTO[];
}

function formatJoinedDate(date: string) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));

  return formattedDate.replace(' de ', ' ').replace('.', '');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-black/5 bg-white">
      <table className="w-full table-fixed border-collapse text-left text-base tracking-[0.32px] text-navy">
        <colgroup>
          <col className="w-[180px]" />
          <col className="w-[45%]" />
          <col className="w-[90px]" />
          <col className="w-[80px]" />
          <col className="w-[110px]" />
          <col className="w-[150px]" />
        </colgroup>
        <thead>
          <tr className="h-[57px] border-b border-black/5">
            <th scope="col" className="px-4 font-normal">
              USUÁRIO
            </th>
            <th scope="col" className="px-4 font-normal">
              EMAIL
            </th>
            <th scope="col" className="px-4 font-normal">
              PLANO
            </th>
            <th scope="col" className="px-4 font-normal">
              JOINED
            </th>
            <th scope="col" className="px-4 font-normal">
              STATUS
            </th>
            <th scope="col" className="px-4 font-normal">
              AÇÕES
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="h-[75px] border-b border-black/5 last:border-b-0">
              <td className="px-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white"
                  >
                    {getInitials(user.name)}
                  </span>
                  <span className="truncate font-semibold" title={user.name}>
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="truncate px-4" title={user.email}>
                {user.email}
              </td>
              <td className="px-4">—</td>
              <td className="px-4 whitespace-nowrap">{formatJoinedDate(user.createdAt)}</td>
              <td className="px-4">
                <span
                  className={`inline-flex h-[42px] items-center rounded-[4px] px-3 font-semibold ${
                    user.status === 'ACTIVE'
                      ? 'bg-[#EBF6ED] text-[#3EA54E]'
                      : 'bg-surface-light text-[#707070]'
                  }`}
                >
                  {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="h-[42px] rounded-[4px] border border-black/10 bg-white px-3 text-navy disabled:cursor-default"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    disabled
                    className="h-[42px] rounded-[4px] border border-black/10 bg-white px-3 text-navy disabled:cursor-default"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
