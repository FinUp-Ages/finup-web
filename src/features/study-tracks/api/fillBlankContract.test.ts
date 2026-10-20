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
  it('converte a resposta da API para o formato da tela', () => {
    expect(
      toFillBlankQuestion({
        id: 'q-1',
        categoryId: 'cat-1',
        type: 'FILL_BLANK',
        status: 'DRAFT',
        title: 'Título',
        statement: 'A ___',
        answers: ['b'],
      }),
    ).toStrictEqual({
      id: 'q-1',
      categoryId: 'cat-1',
      type: 'FILL_BLANK',
      status: 'DRAFT',
      values: { title: 'Título', statement: 'A ___', answers: ['b'], explanation: '' },
    });
  });
});

describe('questionRoutes', () => {
  it('monta as rotas de criacao e de rascunho com os ids codificados', () => {
    expect(questionRoutes.categoryQuestions('cat 1')).toBe(
      '/api/v1/admin/study-tracks/categories/cat%201/questions',
    );
    expect(questionRoutes.question('q-1')).toBe('/api/v1/admin/study-tracks/questions/q-1');
  });
});
