import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/config/httpClient';
import { resetEnv, setEnv } from '@/test/env';
import { getUsers } from './getUsers';

vi.mock('@/shared/config/env', async () => (await import('@/test/env')).mockEnv());

afterEach(() => {
  vi.restoreAllMocks();
  resetEnv();
});

describe('getUsers com mocks', () => {
  it('pagina a lista simulada de 120 usuarios sem chamar HTTP', async () => {
    const get = vi.spyOn(httpClient, 'get');

    const response = await getUsers({ page: 1, size: 20 });

    expect(response).toMatchObject({ page: 1, size: 20, totalElements: 120, totalPages: 6 });
    expect(response.content).toHaveLength(20);
    expect(response.content[0].id).toBe('21');
    expect(get).not.toHaveBeenCalled();
  });

  it('filtra por status', async () => {
    const response = await getUsers({ page: 0, size: 200, status: 'INACTIVE' });
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content.every((user) => user.status === 'INACTIVE')).toBe(true);
  });

  it('busca por nome ou e-mail sem diferenciar maiusculas', async () => {
    const byName = await getUsers({ page: 0, size: 20, search: '  ANA martins ' });
    expect(byName.content.map((user) => user.name)).toEqual(['Ana Martins']);

    const byEmail = await getUsers({ page: 0, size: 20, search: 'lulucassil' });
    expect(byEmail.content.map((user) => user.email)).toEqual(['lulucassil@email.com']);
  });

  it('devolve pagina vazia quando nada combina', async () => {
    const response = await getUsers({ page: 0, size: 20, search: 'ninguem-aqui' });
    expect(response).toMatchObject({ content: [], totalElements: 0, totalPages: 0 });
  });
});

describe('getUsers com a API real', () => {
  it('envia paginacao e filtros para GET /api/v1/admin/users', async () => {
    setEnv({ useMocks: false });
    const data = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data });
    const params = { page: 0, size: 20, status: 'ACTIVE' as const, search: 'ana' };

    expect(await getUsers(params)).toEqual(data);
    expect(get).toHaveBeenCalledWith('/api/v1/admin/users', { params });
  });
});
