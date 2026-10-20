import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import type { FillBlankQuestionPayload } from '../types';
import {
  createQuestionMock,
  getQuestionMock,
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
  it('cria a pergunta como rascunho e permite carrega-la', async () => {
    const created = await settle(createQuestionMock('categoria-reserva', payload));

    expect(created).toMatchObject({ ...payload, categoryId: 'categoria-reserva', status: 'DRAFT' });
    await expect(settle(getQuestionMock(created.id))).resolves.toEqual(created);
  });

  it('atualiza o rascunho de pergunta em DRAFT', async () => {
    const updated = await settle(updateQuestionMock('pergunta-rascunho', payload));

    expect(updated).toMatchObject({ ...payload, id: 'pergunta-rascunho', status: 'DRAFT' });
  });

  it('recusa com 409 em problem+json a edicao de pergunta fora de DRAFT', async () => {
    const error = await settle(updateQuestionMock('pergunta-publicada', payload)).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      problem: { status: 409, detail: 'Somente perguntas em rascunho podem ser editadas.' },
    });
  });

  it('responde 404 para categoria ou pergunta inexistente', async () => {
    await expect(settle(createQuestionMock(MISSING_CATEGORY_ID, payload))).rejects.toMatchObject({
      status: 404,
    });
    await expect(settle(getQuestionMock('nao-existe'))).rejects.toMatchObject({ status: 404 });
  });

  it('responde 400 para corpo invalido', async () => {
    await expect(
      settle(createQuestionMock('categoria-reserva', { ...payload, answers: [] })),
    ).rejects.toMatchObject({ status: 400 });
  });
});
