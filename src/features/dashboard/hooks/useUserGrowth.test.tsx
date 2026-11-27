import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUserGrowth } from '../api/getUserGrowth';
import { getUserGrowthMock } from '../api/userGrowthMock';
import type { UserGrowthDTO } from '../types';
import { useUserGrowth } from './useUserGrowth';

vi.mock('../api/getUserGrowth', () => ({ getUserGrowth: vi.fn() }));

const growth = vi.mocked(getUserGrowth);

function renderGrowth(months = 6) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useUserGrowth(months), { wrapper });
}

function serie(totais: number[], growthPct = 0): UserGrowthDTO {
  return {
    growthPct,
    points: totais.map((totalUsers, indice) => ({
      month: `2026-${String(indice + 1).padStart(2, '0')}`,
      newUsers: 1,
      totalUsers,
    })),
  };
}

beforeEach(() => {
  growth.mockReset();
});

describe('useUserGrowth', () => {
  it('entrega o grafico pronto: percentual, rotulos dos meses e eixo Y redondo', async () => {
    growth.mockResolvedValue(getUserGrowthMock(6));
    const { result } = renderGrowth(6);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.dados).not.toBeNull());

    const dados = result.current.dados!;
    expect(dados.crescimento).toBe('278%');
    expect(dados.pontos[0]).toEqual({
      mes: '2026-02',
      rotulo: 'Fev',
      totalUsuarios: 100,
      novosUsuarios: 8,
    });
    expect(dados.valorMaximo).toBe(500);
    expect(dados.rotulosEixoY).toEqual(['500', '400', '300', '200', '100', '0']);
    expect(growth).toHaveBeenCalledWith(6);
  });

  it.each([
    [[5], 5],
    [[10], 10],
    [[20], 25],
    [[0], 5],
    [[1_200], 2_500],
  ])('arredonda o topo do eixo para a serie %j', async (totais, topo) => {
    growth.mockResolvedValue(serie(totais));
    const { result } = renderGrowth();
    await waitFor(() => expect(result.current.dados?.valorMaximo).toBe(topo));
  });

  it('formata percentual com virgula e mantem mes desconhecido como veio', async () => {
    growth.mockResolvedValue({
      growthPct: 12.5,
      points: [{ month: '2026-13', newUsers: 2, totalUsers: 7 }],
    });
    const { result } = renderGrowth();
    await waitFor(() => expect(result.current.dados).not.toBeNull());
    expect(result.current.dados!.crescimento).toBe('12,5%');
    expect(result.current.dados!.pontos[0].rotulo).toBe('2026-13');
  });

  it('sem pontos, usa o menor eixo possivel', async () => {
    growth.mockResolvedValue({ growthPct: 0, points: [] });
    const { result } = renderGrowth();
    await waitFor(() => expect(result.current.dados).not.toBeNull());
    expect(result.current.dados!.rotulosEixoY).toEqual(['5', '4', '3', '2', '1', '0']);
  });

  it('mostra o erro e busca de novo no reload', async () => {
    growth.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(serie([10]));
    const { result } = renderGrowth();

    await waitFor(() =>
      expect(result.current.errorMessage).toBe(
        'Não foi possível carregar o crescimento dos usuários.',
      ),
    );
    act(() => result.current.reload());

    await waitFor(() => expect(result.current.dados).not.toBeNull());
    expect(result.current.errorMessage).toBeNull();
    expect(growth).toHaveBeenCalledTimes(2);
  });
});
