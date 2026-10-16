/**
 * Contexto da sessao do painel. Fica separado do AuthProvider porque um arquivo de
 * componente so deve exportar componentes (regra react-refresh do ESLint).
 */
import { createContext } from 'react';
import type { AuthState } from '../types';

export interface AuthContextValue {
  state: AuthState;
  /** Resolve quando a tentativa termina; rejeita com LoginError quando ha mensagem a mostrar. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Some com o aviso de sessao expirada ou acesso negado (ex.: ao tentar entrar de novo). */
  dismissNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
