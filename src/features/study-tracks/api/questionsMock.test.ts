import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FillBlankQuestionPayload } from '../types';
import {
  createQuestionMock,
  getCategoryQuestionsMock,
  MISSING_CATEGORY_ID,
  resetQuestionsMock,
  updateQuestionMock,
  publishQuestionMock,
  unpublishQuestionMock,
  discardDraftQuestionMock,
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

  it('publica a pergunta, copiando o draft para published com status PUBLISHED', async () => {
    const published = await settle(publishQuestionMock('pergunta-rascunho'));

    expect(published.status).toBe('PUBLISHED');
    expect(published.published).toEqual(published.draft);
    expect(published.publishedAt).toBeTruthy();
  });

  it('publica rascunhos completos dos tipos que ainda nao tem formulario', async () => {
    // Multipla escolha com enunciado e alternativa correta; conteudo educativo com titulo e texto.
    const multipleChoice = await settle(publishQuestionMock('pergunta-multipla-escolha'));
    const learning = await settle(publishQuestionMock('conteudo-educativo'));

    expect(multipleChoice.status).toBe('PUBLISHED');
    expect(learning.status).toBe('PUBLISHED');
  });

  it('volta a pergunta para rascunho com status DRAFT e published nulo', async () => {
    const unpublished = await settle(unpublishQuestionMock('pergunta-publicada'));

    expect(unpublished.status).toBe('DRAFT');
    expect(unpublished.published).toBeNull();
    expect(unpublished.publishedAt).toBeNull();
  });

  it('descarta alteracoes pendentes revertendo o draft para o conteudo publicado', async () => {
    const [before] = (await settle(getCategoryQuestionsMock('categoria-reserva'))).filter(
      (q) => q.id === 'pergunta-com-alteracoes',
    );

    const discarded = await settle(discardDraftQuestionMock('pergunta-com-alteracoes'));

    expect(discarded.status).toBe('PUBLISHED');
    expect(discarded.draft).toEqual(before.published);
  });

  it('sem alteracoes pendentes, descartar mantem a pergunta publicada', async () => {
    const discarded = await settle(discardDraftQuestionMock('pergunta-publicada'));

    expect(discarded.status).toBe('PUBLISHED');
    expect(discarded.draft).toEqual(discarded.published);
  });

  it('recusa descartar alteracoes de pergunta sem versao publicada', async () => {
    await expect(settle(discardDraftQuestionMock('pergunta-rascunho'))).rejects.toMatchObject({
      status: 409,
      problem: { detail: 'A pergunta não tem versão publicada, então não há edição a descartar.' },
    });
  });

  it('responde 404 para acoes em pergunta inexistente', async () => {
    await expect(settle(publishQuestionMock('nao-existe'))).rejects.toMatchObject({ status: 404 });
    await expect(settle(unpublishQuestionMock('nao-existe'))).rejects.toMatchObject({ status: 404 });
    await expect(settle(discardDraftQuestionMock('nao-existe'))).rejects.toMatchObject({ status: 404 });
  });

});
