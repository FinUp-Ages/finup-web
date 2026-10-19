/**
 * Chamada ao finup-backend que confirma quem esta logado no painel.
 *
 * Unico ponto da feature que conhece essa rota da API.
 * Sem hooks do React, sem estado, sem JSX e sem formatacao para exibicao.
 */
import { httpClient } from '@/shared/config/httpClient';
import type { AdminMeDTO } from '../types';

/**
 * Administrador autenticado (contrato C2). 403 para quem nao esta no grupo admin do
 * Cognito; 404 quando o administrador ainda nao tem registro local no backend.
 */
export async function getAdminMe(): Promise<AdminMeDTO> {
  const { data } = await httpClient.get<AdminMeDTO>('/api/v1/admin/me');
  return data;
}
