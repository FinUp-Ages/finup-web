/**
 * Guarda de rota: redireciona para o login quando nao ha sessao valida.
 *
 * Sessao so existe depois que o backend confirmou que a pessoa e ADMIN, entao estar aqui
 * dentro ja significa ter acesso ao painel. Quando a sessao expira no meio do uso, o login
 * recebe a pagina atual para voltar a ela depois de entrar.
 */
import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { paths } from '@/app/routes/paths';
import { useAuth } from '@/features/auth';
import { FullPageLoader } from '@/shared/components/ui/FullPageLoader';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'loading') {
    return <FullPageLoader label="Conferindo sua sessão…" />;
  }

  if (state.status === 'unauthenticated') {
    const from =
      state.notice === 'session-expired' ? `${location.pathname}${location.search}` : undefined;
    return <Navigate to={paths.login} replace state={from ? { from } : undefined} />;
  }

  return <>{children}</>;
}
