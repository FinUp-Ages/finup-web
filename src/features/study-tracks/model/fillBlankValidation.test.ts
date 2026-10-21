import { describe, expect, it } from 'vitest';
import type { FillBlankFormValues } from '../types';
import {
  fillBlankMessages,
  findRepeatedAnswerIndexes,
  splitStatement,
  validateFillBlankQuestion,
  validateNewAnswer,
} from './fillBlankValidation';

const validValues: FillBlankFormValues = {
  title: 'Rendimento do CDB',
  statement: 'O CDB rende ___ do CDI',
  answers: ['100%'],
  explanation: '',
};

describe('validateFillBlankQuestion', () => {
  it('aceita pergunta valida, com explicacao opcional', () => {
    expect(validateFillBlankQuestion(validValues)).toEqual({});
  });

  it('exige titulo preenchido', () => {
    expect(validateFillBlankQuestion({ ...validValues, title: '   ' }).title).toBe(
      fillBlankMessages.titleRequired,
    );
  });

  it('exige enunciado', () => {
    expect(validateFillBlankQuestion({ ...validValues, statement: ' ' }).statement).toBe(
      fillBlankMessages.statementRequired,
    );
  });

  it('exige a marcacao ___ no enunciado', () => {
    expect(
      validateFillBlankQuestion({ ...validValues, statement: 'O CDB rende __ do CDI' }).statement,
    ).toBe(fillBlankMessages.statementWithoutBlank);
  });

  it('exige pelo menos uma resposta aceita nao vazia', () => {
    expect(validateFillBlankQuestion({ ...validValues, answers: [] }).answers).toBe(
      fillBlankMessages.answersRequired,
    );
    expect(validateFillBlankQuestion({ ...validValues, answers: ['  '] }).answers).toBe(
      fillBlankMessages.answersRequired,
    );
  });

  it('recusa respostas repetidas sem diferenciar maiusculas', () => {
    expect(validateFillBlankQuestion({ ...validValues, answers: ['CDI', ' cdi '] }).answers).toBe(
      fillBlankMessages.answersDuplicated,
    );
  });

  it('avisa quando ha resposta digitada e nao adicionada', () => {
    expect(validateFillBlankQuestion(validValues, 'cem por cento').answers).toBe(
      fillBlankMessages.answerPending,
    );
  });
});

describe('validateNewAnswer', () => {
  it('recusa resposta vazia', () => {
    expect(validateNewAnswer([], '   ')).toBe(fillBlankMessages.answerEmpty);
  });

  it('recusa resposta ja adicionada, comparando sem maiusculas e espacos', () => {
    expect(validateNewAnswer(['Liquidez'], '  liquidez ')).toBe(fillBlankMessages.answerDuplicated);
  });

  it('aceita resposta nova', () => {
    expect(validateNewAnswer(['100%'], 'cem por cento')).toBeNull();
  });
});

describe('splitStatement', () => {
  it('separa os trechos entre as lacunas', () => {
    expect(splitStatement('A ___ e o ___')).toEqual(['A ', ' e o ', '']);
  });
});

describe('findRepeatedAnswerIndexes', () => {
  it('aponta so as repeticoes, sem a primeira ocorrencia e sem respostas vazias', () => {
    expect(findRepeatedAnswerIndexes(['CDI', ' cdi ', '', '', 'Selic', 'CDI'])).toEqual(
      new Set([1, 5]),
    );
  });
});
