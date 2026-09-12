/**
 * Ponto unico de leitura das variaveis de ambiente.
 * Nenhum outro arquivo deve acessar import.meta.env diretamente.
 *
 * Atencao: tudo com prefixo VITE_ vai para o bundle e e publico.
 * Nunca coloque segredo aqui.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;
