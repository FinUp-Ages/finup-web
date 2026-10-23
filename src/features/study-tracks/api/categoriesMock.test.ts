import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FillBlankQuestionPayload } from '../types';
import {
  deleteCategoryMock,
  getCategoriesMock,
  resetCategoriesMock,
  updateCategoryMock,
} from './categoriesMock';
import {
  createQuestionMock,
  getCategoryQuestionsMock,
  resetQuestionsMock,
  updateQuestionMock,
} from './questionsMock';

const payload: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Reserva',
  statement: 'A reserva precisa de ___',
  answers: ['liquidez'],
  explanation: '',
};

async function settle<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  const result = await settled;
  if ('error' in result) throw result.error;
  return result.value;
}

beforeEach(() => {
  vi.useFakeTimers();
  resetCategoriesMock();
  resetQuestionsMock();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('categoriesMock — contagens integradas com as perguntas', () => {
  it('reflete as perguntas existentes e conta publicada com alteracoes nos dois indicadores', async () => {
    const categories = await settle(getCategoriesMock());
    const reserve = categories.find((category) => category.id === 'categoria-reserva');
    const questions = await settle(getCategoryQuestionsMock('categoria-reserva'));

    expect(questions).toHaveLength(5);
    expect(reserve).toMatchObject({ draftCount: 4, publishedCount: 2 });
    expect(
      questions.filter((question) => question.status === 'PUBLISHED_WITH_CHANGES'),
    ).toHaveLength(1);
  });

  it('mostra zero nas categorias cujas listas de perguntas estao vazias', async () => {
    const categories = await settle(getCategoriesMock());
    for (const id of ['categoria-investimentos', 'categoria-orcamento']) {
      expect(await settle(getCategoryQuestionsMock(id))).toHaveLength(0);
      expect(categories.find((category) => category.id === id)).toMatchObject({
        draftCount: 0,
        publishedCount: 0,
      });
    }
  });

  it('atualiza as contagens e o bloqueio de remocao depois de criar uma pergunta', async () => {
    const created = await settle(createQuestionMock('categoria-investimentos', payload));
    const categories = await settle(getCategoriesMock());

    expect(categories.find((category) => category.id === 'categoria-investimentos')).toMatchObject({
      draftCount: 1,
      publishedCount: 0,
    });
    expect(await settle(getCategoryQuestionsMock('categoria-investimentos'))).toEqual([created]);
    await expect(settle(deleteCategoryMock('categoria-investimentos'))).rejects.toMatchObject({
      status: 409,
    });
  });

  it('aumenta rascunhos ao editar uma publicada e preserva a contagem de publicadas', async () => {
    await settle(updateQuestionMock('pergunta-publicada', payload));
    const categories = await settle(getCategoriesMock());

    expect(categories.find((category) => category.id === 'categoria-reserva')).toMatchObject({
      draftCount: 5,
      publishedCount: 2,
    });
    expect(await settle(getCategoryQuestionsMock('categoria-reserva'))).toHaveLength(5);
  });

  it('devolve contagens atuais ao editar a categoria e permite remover uma categoria vazia', async () => {
    await settle(createQuestionMock('categoria-investimentos', payload));
    const updated = await settle(
      updateCategoryMock('categoria-investimentos', {
        name: 'Investimentos atualizados',
        description: '',
      }),
    );
    expect(updated).toMatchObject({
      name: 'Investimentos atualizados',
      draftCount: 1,
      publishedCount: 0,
    });

    await settle(deleteCategoryMock('categoria-orcamento'));

    expect(await settle(getCategoriesMock())).not.toContainEqual(
      expect.objectContaining({ id: 'categoria-orcamento' }),
    );
  });
});
