/**
 * Sessao do painel nos testes: o AuthContext com um estado fixo e acoes simuladas.
 *
 * Testes fora de features/auth (rotas e layouts de app/) usam daqui, para nao importar o
 * interior da feature: este e o unico ponto de teste que conhece o contexto interno.
 */
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/features/auth/session/authContext';
import type { AdminUser, AuthState } from '@/features/auth/types';

export type { AuthState };

export const testAdmin: AdminUser = { id: 'u-1', name: 'Ana Souza', email: 'ana@finup.com' };

export const authenticated: AuthState = { status: 'authenticated', admin: testAdmin };

/** Valor do contexto com o estado pedido; as acoes sao vi.fn(), ou as que vierem em `actions`. */
export function sessionValue(
  state: AuthState,
  actions: Partial<Omit<AuthContextValue, 'state'>> = {},
): AuthContextValue {
  return { state, signIn: vi.fn(), signOut: vi.fn(), dismissNotice: vi.fn(), ...actions };
}

/** Envolve a arvore do teste com a sessao. */
export function withSession(value: AuthContextValue, children: ReactNode) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
