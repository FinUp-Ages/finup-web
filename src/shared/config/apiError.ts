/**
 * Erro normalizado das chamadas ao finup-backend.
 *
 * O httpClient rejeita toda falha com um ApiError, entao quem trata erro (hooks, providers)
 * olha `status` e `problem` em vez de conhecer o formato do Axios.
 * `status` e null quando a resposta nem chegou (sem rede, CORS, servidor fora do ar).
 */
import { isAxiosError } from 'axios';
import type { ProblemDetail } from '@/shared/types/problemDetail';

/** `type` que o backend usa no 403 de quem nao tem o papel exigido pela rota. */
const ACCESS_DENIED_TYPE = 'https://finup.com.br/errors/forbidden';

export class ApiError extends Error {
  readonly status: number | null;
  readonly problem: ProblemDetail | null;

  constructor(status: number | null, problem: ProblemDetail | null) {
    super(problem?.detail ?? (status ? `HTTP ${status}` : 'Falha de rede'));
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** 403 do Spring Security: token valido, mas sem o grupo exigido. */
  get isAccessDenied(): boolean {
    return this.status === 403 && this.problem?.type === ACCESS_DENIED_TYPE;
  }
}

function isProblemDetail(body: unknown): body is ProblemDetail {
  return (
    typeof body === 'object' && body !== null && typeof (body as ProblemDetail).status === 'number'
  );
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (isAxiosError(error) && error.response) {
    const body: unknown = error.response.data;
    return new ApiError(error.response.status, isProblemDetail(body) ? body : null);
  }
  return new ApiError(null, null);
}
