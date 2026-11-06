import { describe, expect, it } from 'vitest';
import type { QuestionDTO } from '../types';
import { toMultipleChoicePayload, toMultipleChoiceQuestion } from './multipleChoiceContract';

describe('multipleChoiceContract', () => {
  it('converte valores do formulario para MultipleChoiceQuestionPayload aparando espacos', () => {
    const payload = toMultipleChoicePayload({
      statement: '  Onde guardar a reserva de emergência?  ',
      options: [
        { text: '  CDB com liquidez diária  ', correct: true },
        { text: '  Imóvel sem liquidez  ', correct: false },
      ],
      explanation: '  A reserva precisa estar acessível rapidamente.  ',
    });

    expect(payload).toEqual({
      type: 'MULTIPLE_CHOICE',
      statement: 'Onde guardar a reserva de emergência?',
      options: [
        { text: 'CDB com liquidez diária', correct: true },
        { text: 'Imóvel sem liquidez', correct: false },
      ],
      explanation: 'A reserva precisa estar acessível rapidamente.',
    });
  });

  it('converte QuestionDTO de tipo MULTIPLE_CHOICE para MultipleChoiceQuestion', () => {
    const dto: QuestionDTO = {
      id: 'q-mc-1',
      status: 'DRAFT',
      draft: {
        type: 'MULTIPLE_CHOICE',
        statement: 'O que é liquidez?',
        options: [
          { text: 'Facilidade de converter em dinheiro', correct: true },
          { text: 'Taxa cobrada pelo banco', correct: false },
        ],
        explanation: 'Liquidez mede a velocidade de resgate.',
      },
      published: null,
      updatedAt: '2026-10-20T12:00:00Z',
      publishedAt: null,
    };

    expect(toMultipleChoiceQuestion(dto)).toEqual({
      id: 'q-mc-1',
      type: 'MULTIPLE_CHOICE',
      status: 'DRAFT',
      values: {
        statement: 'O que é liquidez?',
        options: [
          { text: 'Facilidade de converter em dinheiro', correct: true },
          { text: 'Taxa cobrada pelo banco', correct: false },
        ],
        explanation: 'Liquidez mede a velocidade de resgate.',
      },
    });
  });

  it('preserva o tipo original quando o DTO nao e MULTIPLE_CHOICE', () => {
    const dto: QuestionDTO = {
      id: 'q-fb-1',
      status: 'DRAFT',
      draft: {
        type: 'FILL_BLANK',
        title: 'Lacuna',
        statement: 'O CDB rende ___ do CDI',
        answers: ['100%'],
        explanation: '',
      },
      published: null,
      updatedAt: '2026-10-20T12:00:00Z',
      publishedAt: null,
    };

    const question = toMultipleChoiceQuestion(dto);
    expect(question.type).toBe('FILL_BLANK');
    expect(question.values).toEqual({
      statement: '',
      options: [],
      explanation: '',
    });
  });
});

