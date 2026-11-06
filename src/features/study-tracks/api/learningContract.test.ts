import { describe, expect, it } from 'vitest';
import type { QuestionDTO } from '../types';
import { toLearningPayload, toLearningQuestion } from './learningContract';

describe('learningContract', () => {
  it('converte valores de formulario para LearningQuestionPayload aparando so o titulo', () => {
    const payload = toLearningPayload({
      title: '  Reserva de Emergência  ',
      body: '    const codigo = 1;\n\n# Titulo\nTexto explicativo',
    });

    expect(payload).toEqual({
      type: 'LEARNING',
      title: 'Reserva de Emergência',
      body: '    const codigo = 1;\n\n# Titulo\nTexto explicativo',
    });
  });

  it('converte QuestionDTO de tipo LEARNING para LearningQuestion', () => {
    const dto: QuestionDTO = {
      id: 'conteudo-1',
      status: 'DRAFT',
      draft: {
        type: 'LEARNING',
        title: 'Como investir',
        body: 'Passo a passo para investir...',
      },
      published: null,
      updatedAt: '2026-10-28T10:00:00Z',
      publishedAt: null,
    };

    const question = toLearningQuestion(dto);
    expect(question).toEqual({
      id: 'conteudo-1',
      type: 'LEARNING',
      status: 'DRAFT',
      values: {
        title: 'Como investir',
        body: 'Passo a passo para investir...',
      },
    });
  });

  it('retorna null quando o QuestionDTO for de outro tipo', () => {
    const dto: QuestionDTO = {
      id: 'pergunta-1',
      status: 'DRAFT',
      draft: {
        type: 'FILL_BLANK',
        title: 'Preencher',
        statement: 'Frase ___',
        answers: ['resposta'],
        explanation: 'Explicacao',
      },
      published: null,
      updatedAt: '2026-10-28T10:00:00Z',
      publishedAt: null,
    };

    expect(toLearningQuestion(dto)).toBeNull();
  });
});
