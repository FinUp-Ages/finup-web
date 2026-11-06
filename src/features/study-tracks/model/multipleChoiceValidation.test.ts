import { describe, expect, it } from 'vitest';
import {
  findEmptyOptionIndexes,
  findRepeatedOptionIndexes,
  multipleChoiceMessages,
  validateMultipleChoiceQuestion,
} from './multipleChoiceValidation';

describe('validateMultipleChoiceQuestion', () => {
  it('rejeita enunciado vazio ou somente espacos', () => {
    const errors = validateMultipleChoiceQuestion({
      statement: '   ',
      options: [
        { text: 'Alternativa A', correct: true },
        { text: 'Alternativa B', correct: false },
      ],
    });

    expect(errors.statement).toBe(multipleChoiceMessages.statementRequired);
  });

  it('rejeita menos de duas alternativas ou menos de duas preenchidas', () => {
    expect(
      validateMultipleChoiceQuestion({
        statement: 'Pergunta?',
        options: [{ text: 'Apenas uma', correct: true }],
      }).options,
    ).toBe(multipleChoiceMessages.optionsMinCount);

    expect(
      validateMultipleChoiceQuestion({
        statement: 'Pergunta?',
        options: [
          { text: 'Apenas uma preenchida', correct: true },
          { text: '   ', correct: false },
        ],
      }).options,
    ).toBe(multipleChoiceMessages.optionsMinCount);
  });

  it('rejeita alternativa extra em branco quando ja existem duas preenchidas', () => {
    const errors = validateMultipleChoiceQuestion({
      statement: 'Pergunta?',
      options: [
        { text: 'Alternativa A', correct: true },
        { text: 'Alternativa B', correct: false },
        { text: '  ', correct: false },
      ],
    });

    expect(errors.options).toBe(multipleChoiceMessages.optionTextRequired);
    expect([...findEmptyOptionIndexes([
      { text: 'Alternativa A', correct: true },
      { text: '  ', correct: false },
    ])]).toEqual([1]);
  });

  it('rejeita alternativas repetidas sem diferenciar maiusculas de minusculas', () => {
    const options = [
      { text: 'Tesouro Selic', correct: true },
      { text: ' tesouro selic ', correct: false },
    ];
    const errors = validateMultipleChoiceQuestion({
      statement: 'Pergunta?',
      options,
    });

    expect(errors.options).toBe(multipleChoiceMessages.optionsDuplicated);
    expect([...findRepeatedOptionIndexes(options)]).toEqual([1]);
  });

  it('rejeita quando nenhuma ou mais de uma alternativa esta marcada como correta', () => {
    expect(
      validateMultipleChoiceQuestion({
        statement: 'Pergunta?',
        options: [
          { text: 'Alternativa A', correct: false },
          { text: 'Alternativa B', correct: false },
        ],
      }).correctOption,
    ).toBe(multipleChoiceMessages.correctOptionRequired);

    expect(
      validateMultipleChoiceQuestion({
        statement: 'Pergunta?',
        options: [
          { text: 'Alternativa A', correct: true },
          { text: 'Alternativa B', correct: true },
        ],
      }).correctOption,
    ).toBe(multipleChoiceMessages.correctOptionRequired);
  });

  it('aceita pergunta objetiva valida com pelo menos duas alternativas e exatamente uma correta', () => {
    const errors = validateMultipleChoiceQuestion({
      statement: 'Onde guardar a reserva de emergência?',
      options: [
        { text: 'Em investimento de alta liquidez', correct: true },
        { text: 'Em ações voláteis', correct: false },
      ],
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });
});

