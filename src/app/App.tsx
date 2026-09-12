/**
 * Componente raiz.
 * Responsavel apenas por montar os providers globais (QueryClient, Router, contexts)
 * e delegar as rotas. Nenhuma tela ou regra de negocio deve viver aqui.
 */
import { AppRouter } from '@/app/routes';

export default function App() {
  // TODO: implementar em tarefa futura — QueryClientProvider (shared/config/queryClient.ts) e providers globais (app/providers/).
  return <AppRouter />;
}
