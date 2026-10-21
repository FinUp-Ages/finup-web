import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { httpClient } from '@/shared/config/httpClient';
import { getCategoryQuestions } from './getCategoryQuestions';
import { getCategoryQuestionsMock } from './questionsMock';

const { mockEnv } = vi.hoisted(() => ({ mockEnv: { useMocks: false } }));
vi.mock('@/shared/config/env', () => ({ env: mockEnv }));
vi.mock('@/shared/config/httpClient', () => ({ httpClient: { get: vi.fn() } }));
vi.mock('./questionsMock', () => ({ getCategoryQuestionsMock: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.useMocks = false;
});

describe('getCategoryQuestions', () => {
  it('consulta o GET do C6 com o id da categoria codificado', async () => {
    const questions = [{ id: 'q-1', status: 'DRAFT' }];
    vi.mocked(httpClient.get).mockResolvedValue({ data: questions });

    expect(await getCategoryQuestions('cat / 1')).toBe(questions);
    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/admin/study-tracks/categories/cat%20%2F%201/questions',
    );
    expect(getCategoryQuestionsMock).not.toHaveBeenCalled();
  });

  it('usa o mock quando VITE_USE_MOCKS esta ativo, sem chamar a API', async () => {
    mockEnv.useMocks = true;
    vi.mocked(getCategoryQuestionsMock).mockResolvedValue([]);

    expect(await getCategoryQuestions('cat-1')).toEqual([]);
    expect(getCategoryQuestionsMock).toHaveBeenCalledWith('cat-1');
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it('preserva o erro normalizado pelo cliente HTTP', async () => {
    const error = new ApiError(404, null);
    vi.mocked(httpClient.get).mockRejectedValue(error);

    await expect(getCategoryQuestions('inexistente')).rejects.toBe(error);
  });
});
