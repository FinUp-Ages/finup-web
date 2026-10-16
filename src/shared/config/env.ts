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
  /**
   * User Pool do Cognito usado no login do painel. O client ID e o do app client do PAINEL,
   * sem client secret — nao e segredo, mas muda por ambiente.
   */
  cognito: {
    region: import.meta.env.VITE_COGNITO_REGION ?? '',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
  },
} as const;
