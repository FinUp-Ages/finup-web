import { describe, expect, it } from 'vitest';
import { questionRoutes, toFillBlankPayload, toFillBlankQuestion } from './fillBlankContract';

describe('toFillBlankPayload', () => {
  it('monta exatamente o corpo FILL_BLANK do C6, com textos aparados e sem respostas vazias', () => {
    const payload = toFillBlankPayload({
      title: ' Rendimento do CDB ',
      statement: ' O CDB rende ___ do CDI ',
      answers: [' 100% ', '', 'cem por cento'],
      explanation: ' Explicação ',
    });

    expect(payload).toStrictEqual({
      type: 'FILL_BLANK',
      title: 'Rendimento do CDB',
      statement: 'O CDB rende ___ do CDI',
      answers: ['100%', 'cem por cento'],
      explanation: 'Explicação',
    });
  });
});

describe('toFillBlankQuestion', () => {
  it('le os valores do rascunho, nao da versao publicada', () => {
    expect(
      toFillBlankQuestion({
        id: 'q-1',
        status: 'PUBLISHED_WITH_CHANGES',
        draft: {
          type: 'FILL_BLANK',
          title: 'Rascunho',
          statement: 'A ___',
          answers: ['b'],
          explanation: '',
        },
        published: {
          type: 'FILL_BLANK',
          title: 'Publicada',
          statement: 'A ___',
          answers: ['a'],
          explanation: '',
        },
        updatedAt: '2026-10-20T12:00:00Z',
        publishedAt: '2026-10-18T12:00:00Z',
      }),
    ).toStrictEqual({
      id: 'q-1',
      type: 'FILL_BLANK',
      status: 'PUBLISHED_WITH_CHANGES',
      values: { title: 'Rascunho', statement: 'A ___', answers: ['b'], explanation: '' },
    });
  });

  it('devolve valores vazios para pergunta de outro tipo', () => {
    expect(
      toFillBlankQuestion({
        id: 'q-2',
        status: 'DRAFT',
        draft: { type: 'MULTIPLE_CHOICE' },
        published: null,
        updatedAt: '2026-10-20T12:00:00Z',
        publishedAt: null,
      }),
    ).toMatchObject({
      type: 'MULTIPLE_CHOICE',
      values: { title: '', statement: '', answers: [], explanation: '' },
    });
  });
});

describe('questionRoutes', () => {
  it('monta as rotas da categoria e do rascunho com os ids codificados', () => {
    expect(questionRoutes.categoryQuestions('cat 1')).toBe(
      '/api/v1/admin/study-tracks/categories/cat%201/questions',
    );
    expect(questionRoutes.question('q-1')).toBe('/api/v1/admin/study-tracks/questions/q-1');
  });
});
