/**
 * Ponto unico de leitura das variaveis de ambiente.
 * Nenhum outro arquivo deve acessar import.meta.env diretamente.
 *
 * Atencao: tudo com prefixo VITE_ vai para o bundle e e publico.
 * Nunca coloque segredo aqui.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  /** Com "true", as features usam os mocks de api/ em vez de chamar o backend. */
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;
