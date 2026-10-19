/**
 * Corpo de erro do finup-backend, em RFC 7807 (application/problem+json).
 * Todo erro da API tem pelo menos `status`; `detail` e uma frase em portugues.
 */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  traceId?: string;
}
