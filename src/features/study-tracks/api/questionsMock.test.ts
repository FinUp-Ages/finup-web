import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FillBlankQuestionPayload } from '../types';
import {
  createQuestionMock,
  getCategoryQuestionsMock,
  MISSING_CATEGORY_ID,
  resetQuestionsMock,
  updateQuestionMock,
} from './questionsMock';

const payload: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Liquidez',
  statement: 'A reserva precisa de alta ___',
  answers: ['liquidez'],
  explanation: '',
};

/** Avanca a latencia simulada do mock e devolve a promessa ja resolvida ou rejeitada. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  const result = await settled;
  if ('error' in result) {
    throw result.error;
  }
  return result.value;
}

beforeEach(() => {
  vi.useFakeTimers();
  resetQuestionsMock();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('questionsMock', () => {
  it('cria a pergunta como rascunho, no formato de resposta do C6, e lista na categoria', async () => {
    const created = await settle(createQuestionMock('categoria-reserva', payload));

    expect(created).toMatchObject({
      status: 'DRAFT',
      draft: payload,
      published: null,
      publishedAt: null,
    });
    expect(created).not.toHaveProperty('categoryId');
    // Id sequencial: crypto.randomUUID nao existe fora de HTTPS/localhost.
    expect(created.id).toMatch(/^pergunta-nova-\d+$/);
    const questions = await settle(getCategoryQuestionsMock('categoria-reserva'));
    expect(questions).toContainEqual(created);
  });

  it('lista com o status derivado de draft e published', async () => {
    const questions = await settle(getCategoryQuestionsMock('categoria-reserva'));
    const statusById = Object.fromEntries(
      questions.map((question) => [question.id, question.status]),
    );

    expect(statusById).toMatchObject({
      'pergunta-rascunho': 'DRAFT',
      'pergunta-publicada': 'PUBLISHED',
      'pergunta-com-alteracoes': 'PUBLISHED_WITH_CHANGES',
    });
  });

  it('PUT em pergunta publicada altera so o draft e deixa PUBLISHED_WITH_CHANGES', async () => {
    const [before] = (await settle(getCategoryQuestionsMock('categoria-reserva'))).filter(
      (question) => question.id === 'pergunta-publicada',
    );

    const updated = await settle(updateQuestionMock('pergunta-publicada', payload));

    expect(updated.status).toBe('PUBLISHED_WITH_CHANGES');
    expect(updated.draft).toEqual(payload);
    expect(updated.published).toEqual(before.published);
    expect(updated.publishedAt).toBe(before.publishedAt);
  });

  it('PUT que volta o draft ao conteudo publicado deixa PUBLISHED', async () => {
    const [question] = (await settle(getCategoryQuestionsMock('categoria-reserva'))).filter(
      (item) => item.id === 'pergunta-com-alteracoes',
    );

    const updated = await settle(
      updateQuestionMock('pergunta-com-alteracoes', question.published as FillBlankQuestionPayload),
    );

    expect(updated.status).toBe('PUBLISHED');
  });

  it('responde 404 em problem+json para categoria ou pergunta inexistente', async () => {
    await expect(settle(createQuestionMock(MISSING_CATEGORY_ID, payload))).rejects.toMatchObject({
      status: 404,
      problem: { status: 404, detail: 'Categoria não encontrada.' },
    });
    await expect(settle(getCategoryQuestionsMock(MISSING_CATEGORY_ID))).rejects.toMatchObject({
      status: 404,
    });
    await expect(settle(updateQuestionMock('nao-existe', payload))).rejects.toMatchObject({
      status: 404,
    });
  });

  it('responde 400 para corpo invalido', async () => {
    await expect(
      settle(createQuestionMock('categoria-reserva', { ...payload, answers: [] })),
    ).rejects.toMatchObject({ status: 400 });
  });
});
