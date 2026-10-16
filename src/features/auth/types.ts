/**
 * Tipos da feature "auth".
 * Tipos usados por mais de uma feature vao para shared/types/.
 */

/** Resposta bruta de GET /api/v1/admin/me (contrato C2). */
export interface AdminMeDTO {
  id: string;
  /** O backend omite o campo quando o Cognito nao tem nome para a pessoa. */
  name?: string | null;
  email: string;
  role: string;
}

/** Administrador logado, no formato que as telas exibem. */
export interface AdminUser {
  id: string;
  /** Nome, ou o e-mail quando nao ha nome. */
  name: string;
  email: string;
}

/** Por que a sessao terminou, para a tela de login explicar. */
export type AuthNotice = 'session-expired' | 'access-denied' | 'unavailable';

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; admin: AdminUser }
  | { status: 'unauthenticated'; notice: AuthNotice | null };
