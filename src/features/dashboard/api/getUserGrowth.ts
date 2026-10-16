/**
 * Chamadas de API do card "Crescimento do usuário" (contrato C3).
 *
 * Unico ponto da feature que conhece a rota da API.
 * Sem hooks do React, sem estado, sem JSX e sem formatacao para exibicao.
 */
import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/config/httpClient';
import type { UserGrowthDTO } from '../types';
import { getUserGrowthMock } from './userGrowthMock';

export async function getUserGrowth(months: number): Promise<UserGrowthDTO> {
  if (env.useMocks) {
    return getUserGrowthMock(months);
  }

  const { data } = await httpClient.get<UserGrowthDTO>('/api/v1/admin/metrics/user-growth', {
    params: { months },
  });
  return data;
}
