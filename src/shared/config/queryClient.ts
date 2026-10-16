/**
 * Configuracao do QueryClient do TanStack Query:
 * staleTime, retry, refetchOnWindowFocus e tratamento global de erro.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// TODO: implementar em tarefa futura — staleTime por tipo de dado e tratamento global de erro.
