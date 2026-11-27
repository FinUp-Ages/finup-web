import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/config/httpClient';
import { createCurrentUser } from './createCurrentUser';
import { getAdminMe } from './getAdminMe';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('chamadas de sessao ao backend', () => {
  it('getAdminMe le o administrador do contrato C2', async () => {
    const admin = { id: 'u-1', name: 'Ana', email: 'ana@finup.com', role: 'ADMIN' };
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: admin });

    await expect(getAdminMe()).resolves.toEqual(admin);
    expect(get).toHaveBeenCalledWith('/api/v1/admin/me');
  });

  it('createCurrentUser cria o registro local sem corpo', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: undefined });

    await expect(createCurrentUser()).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('/api/v1/users');
  });

  it('propaga a falha do backend', async () => {
    vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('offline'));
    await expect(getAdminMe()).rejects.toThrow('offline');
  });
});
