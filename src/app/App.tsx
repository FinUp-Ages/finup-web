/**
 * Componente raiz.
 * Responsavel apenas por montar os providers globais (QueryClient, Router, contexts)
 * e delegar as rotas. Nenhuma tela ou regra de negocio deve viver aqui.
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/app/routes';
import { queryClient } from '@/shared/config/queryClient';

export default function App() {
  // TODO: implementar em tarefa futura — demais providers globais (app/providers/).
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
