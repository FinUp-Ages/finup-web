/**
 * Sessao do painel: quem esta logado e as acoes de login e logout.
 * Precisa estar dentro do AuthProvider, montado no App.
 */
import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../session/authContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.');
  }
  return context;
}
