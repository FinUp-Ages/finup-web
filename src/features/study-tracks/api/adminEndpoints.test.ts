import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/config/httpClient';
import type { QuestionPayload } from '../types';
import { createCategory } from './createCategory';
import { createQuestion } from './createQuestion';
import { deleteCategory } from './deleteCategory';
import { discardDraftQuestion } from './discardDraftQuestion';
import { getCategories } from './getCategories';
import { publishQuestion } from './publishQuestion';
import { unpublishQuestion } from './unpublishQuestion';
import { updateCategory } from './updateCategory';
import { updateQuestion } from './updateQuestion';

// Rotas reais do C6 com VITE_USE_MOCKS desligado: cada funcao chama o metodo e o caminho certos.
vi.mock('@/shared/config/env', async () =>
  (await import('@/test/env')).mockEnv({ useMocks: false }),
);

const BASE = '/api/v1/admin/study-tracks';
const category = { name: 'Metas', description: '' };
const question: QuestionPayload = {
  type: 'LEARNING',
  title: 'Guia',
  body: 'Texto',
};
const dto = { id: 'x' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('endpoints de categorias', () => {
  it('lista as categorias', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: [dto] });
    await expect(getCategories()).resolves.toEqual([dto]);
    expect(get).toHaveBeenCalledWith(`${BASE}/categories`);
  });

  it('cria com POST', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: dto });
    await expect(createCategory(category)).resolves.toEqual(dto);
    expect(post).toHaveBeenCalledWith(`${BASE}/categories`, category);
  });

  it('edita com PUT, codificando o id', async () => {
    const put = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: dto });
    await expect(updateCategory('a/b', category)).resolves.toEqual(dto);
    expect(put).toHaveBeenCalledWith(`${BASE}/categories/a%2Fb`, category);
  });

  it('remove com DELETE', async () => {
    const remove = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: undefined });
    await expect(deleteCategory('cat-1')).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith(`${BASE}/categories/cat-1`);
  });
});

describe('endpoints de perguntas', () => {
  it('cria a pergunta na categoria', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: dto });
    await expect(createQuestion('cat-1', question)).resolves.toEqual(dto);
    expect(post).toHaveBeenCalledWith(`${BASE}/categories/cat-1/questions`, question);
  });

  it('atualiza o rascunho', async () => {
    const put = vi.spyOn(httpClient, 'put').mockResolvedValue({ data: dto });
    await expect(updateQuestion('q-1', question)).resolves.toEqual(dto);
    expect(put).toHaveBeenCalledWith(`${BASE}/questions/q-1`, question);
  });

  it.each([
    ['publica', publishQuestion, `${BASE}/questions/q-1/publish`],
    ['volta para rascunho', unpublishQuestion, `${BASE}/questions/q-1/unpublish`],
  ])('%s com POST', async (_, call, path) => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: dto });
    await expect(call('q-1')).resolves.toEqual(dto);
    expect(post).toHaveBeenCalledWith(path);
  });

  it('descarta as alteracoes do rascunho com DELETE', async () => {
    const remove = vi.spyOn(httpClient, 'delete').mockResolvedValue({ data: dto });
    await expect(discardDraftQuestion('q-1')).resolves.toEqual(dto);
    expect(remove).toHaveBeenCalledWith(`${BASE}/questions/q-1/draft`);
  });
});
