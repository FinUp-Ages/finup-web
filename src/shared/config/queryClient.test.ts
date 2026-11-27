import { describe, expect, it } from 'vitest';
import { ApiError } from './apiError';
import { queryClient } from './queryClient';

const retry = queryClient.getDefaultOptions().queries?.retry as (
  failureCount: number,
  error: unknown,
) => boolean;

describe('queryClient', () => {
  it('nao refaz a busca ao voltar o foco para a janela', () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('nao repete erro 4xx', () => {
    expect(retry(0, new ApiError(400, null))).toBe(false);
    expect(retry(0, new ApiError(404, null))).toBe(false);
  });

  it('repete uma vez falha de rede ou 5xx', () => {
    expect(retry(0, new ApiError(null, null))).toBe(true);
    expect(retry(0, new ApiError(503, null))).toBe(true);
    expect(retry(0, new Error('qualquer'))).toBe(true);
    expect(retry(1, new ApiError(503, null))).toBe(false);
  });
});
