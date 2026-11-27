import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './apiError';

const FORBIDDEN_TYPE = 'https://finup.com.br/errors/forbidden';

function axiosErrorWith(status: number, data: unknown) {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('falha', 'ERR_BAD_REQUEST', config, null, response);
}

describe('ApiError', () => {
  it('usa o detail do problem+json como mensagem', () => {
    const error = new ApiError(400, {
      status: 400,
      title: 'Bad Request',
      detail: 'Campo invalido',
    });
    expect(error.message).toBe('Campo invalido');
    expect(error.name).toBe('ApiError');
  });

  it('cai no status HTTP ou na falha de rede quando nao ha detail', () => {
    expect(new ApiError(500, null).message).toBe('HTTP 500');
    expect(new ApiError(null, null).message).toBe('Falha de rede');
  });

  it('so considera acesso negado o 403 com o type do backend', () => {
    expect(new ApiError(403, { status: 403, type: FORBIDDEN_TYPE }).isAccessDenied).toBe(true);
    expect(new ApiError(403, { status: 403, type: 'outro' }).isAccessDenied).toBe(false);
    expect(new ApiError(403, null).isAccessDenied).toBe(false);
    expect(new ApiError(401, { status: 401, type: FORBIDDEN_TYPE }).isAccessDenied).toBe(false);
  });
});

describe('toApiError', () => {
  it('devolve o mesmo ApiError sem embrulhar de novo', () => {
    const original = new ApiError(404, null);
    expect(toApiError(original)).toBe(original);
  });

  it('le status e problem+json da resposta do Axios', () => {
    const problem = { status: 409, title: 'Conflict', detail: 'Ja existe' };
    const error = toApiError(axiosErrorWith(409, problem));
    expect(error.status).toBe(409);
    expect(error.problem).toEqual(problem);
  });

  it('ignora corpo que nao e problem+json', () => {
    const error = toApiError(axiosErrorWith(502, '<html>Bad gateway</html>'));
    expect(error.status).toBe(502);
    expect(error.problem).toBeNull();
  });

  it('trata erro sem resposta como falha de rede', () => {
    expect(toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))).toMatchObject({
      status: null,
      problem: null,
    });
    expect(toApiError(new Error('qualquer'))).toMatchObject({ status: null });
  });
});
