/**
 * Configuracao do QueryClient do TanStack Query:
 * staleTime, retry, refetchOnWindowFocus e tratamento global de erro.
 */
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/config/apiError';

/** Erro 4xx nao muda com nova tentativa; 401 e 403 ja sao tratados pelo httpClient. */
function isClientError(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status !== null && error.status >= 400 && error.status < 500
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isClientError(error) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
});

// TODO: implementar em tarefa futura — staleTime por tipo de dado e tratamento global de erro.
