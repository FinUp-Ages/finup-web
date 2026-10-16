/**
 * Primeiro acesso do administrador ao painel.
 *
 * Unico ponto da feature que conhece essa rota da API.
 * Sem hooks do React, sem estado, sem JSX e sem formatacao para exibicao.
 */
import { httpClient } from '@/shared/config/httpClient';

/**
 * Cria o registro local da identidade do token (POST /api/v1/users, sem corpo). O backend
 * le nome e e-mail do proprio Cognito. 409 se o registro ja existir.
 */
export async function createCurrentUser(): Promise<void> {
  await httpClient.post('/api/v1/users');
}
