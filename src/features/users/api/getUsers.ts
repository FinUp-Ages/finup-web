import { httpClient } from '@/shared/config/httpClient';
import { env } from '@/shared/config/env';
import type { GetUsersParams, UserDTO, UsersResponse } from '../types';

const sampleUsers: UserDTO[] = [
  {
    id: '1',
    name: 'Carlos José',
    email: 'carlos.j@email.com',
    createdAt: '2026-08-24T10:00:00Z',
    lastSeenAt: '2026-10-05T18:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Ana Martins',
    email: 'anamartins@email.com',
    createdAt: '2026-08-20T10:00:00Z',
    lastSeenAt: '2026-10-04T12:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Lucas Silva',
    email: 'lulucassil@email.com',
    createdAt: '2026-08-18T10:00:00Z',
    lastSeenAt: '2026-09-27T09:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    createdAt: '2026-08-15T10:00:00Z',
    lastSeenAt: '2026-09-02T14:00:00Z',
    status: 'INACTIVE',
  },
];

const mockUsers: UserDTO[] = [
  ...sampleUsers,
  ...Array.from({ length: 116 }, (_, index) => {
    const userNumber = index + sampleUsers.length + 1;
    const isActive = userNumber % 3 !== 0;

    return {
      id: String(userNumber),
      name: `Usuário FinUp ${userNumber}`,
      email: `usuario${userNumber}@email.com`,
      createdAt: '2026-04-01T10:00:00Z',
      lastSeenAt: isActive ? '2026-10-05T10:00:00Z' : '2026-03-15T10:00:00Z',
      status: isActive ? 'ACTIVE' : 'INACTIVE',
    } satisfies UserDTO;
  }),
];

function getMockUsers({ page, size, status, search = '' }: GetUsersParams): UsersResponse {
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredUsers = mockUsers.filter((user) => {
    const matchesStatus = !status || user.status === status;
    const matchesSearch =
      !normalizedSearch ||
      user.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      user.email.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
  const firstItem = page * size;

  return {
    content: filteredUsers.slice(firstItem, firstItem + size),
    page,
    size,
    totalElements: filteredUsers.length,
    totalPages: Math.ceil(filteredUsers.length / size),
  };
}

export async function getUsers(params: GetUsersParams): Promise<UsersResponse> {
  if (env.useMocks) {
    return getMockUsers(params);
  }

  const { data } = await httpClient.get<UsersResponse>('/api/v1/admin/users', { params });
  return data;
}
