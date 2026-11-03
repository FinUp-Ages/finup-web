import { describe, expect, it } from 'vitest';
import {
  learningMessages,
  validateLearningQuestion,
} from './learningValidation';

describe('validateLearningQuestion', () => {
  it('rejeita titulo vazio ou somente espacos', () => {
    expect(validateLearningQuestion({ title: '', body: 'Conteudo' }).title).toBe(
      learningMessages.titleRequired,
    );
    expect(validateLearningQuestion({ title: '   ', body: 'Conteudo' }).title).toBe(
      learningMessages.titleRequired,
    );
  });

  it('rejeita corpo vazio ou somente espacos', () => {
    expect(validateLearningQuestion({ title: 'Titulo', body: '' }).body).toBe(
      learningMessages.bodyRequired,
    );
    expect(validateLearningQuestion({ title: 'Titulo', body: '   \n\t  ' }).body).toBe(
      learningMessages.bodyRequired,
    );
  });

  it('aceita valores validos e com markdown', () => {
    const errors = validateLearningQuestion({
      title: 'Reserva de Emergência',
      body: '# O que é?\nUma **reserva** de emergência serve para imprevistos.',
    });
    expect(errors.title).toBeUndefined();
    expect(errors.body).toBeUndefined();
    expect(Object.keys(errors)).toHaveLength(0);
  });
});
