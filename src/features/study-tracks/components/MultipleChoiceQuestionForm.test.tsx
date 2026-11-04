import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { multipleChoiceMessages } from '../model/multipleChoiceValidation';
import { MultipleChoiceQuestionForm } from './MultipleChoiceQuestionForm';

describe('MultipleChoiceQuestionForm', () => {
  it('valida enunciado, pelo menos duas alternativas e alternativa correta no envio', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MultipleChoiceQuestionForm
        initialValues={{
          statement: '',
          options: [
            { text: '', correct: false },
            { text: '', correct: false },
          ],
          explanation: '',
        }}
        submitLabel="Criar rascunho"
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(screen.getByText(multipleChoiceMessages.statementRequired)).toBeVisible();
    expect(screen.getByText(multipleChoiceMessages.optionsMinCount)).toBeVisible();
    expect(screen.getByText(multipleChoiceMessages.correctOptionRequired)).toBeVisible();
    expect(screen.getByLabelText('Enunciado')).toHaveFocus();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('permite adicionar e remover alternativas e selecionar a correta', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MultipleChoiceQuestionForm
        initialValues={{
          statement: '',
          options: [
            { text: '', correct: false },
            { text: '', correct: false },
          ],
          explanation: '',
        }}
        submitLabel="Criar rascunho"
        onSubmit={handleSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Enunciado'), 'Qual ativo tem liquidez diária?');
    await user.type(screen.getByLabelText('Alternativa 1'), 'Tesouro Selic');
    await user.type(screen.getByLabelText('Alternativa 2'), 'Imóvel residencial');

    await user.click(screen.getByRole('button', { name: 'Adicionar alternativa' }));
    expect(screen.getByLabelText('Alternativa 3')).toBeVisible();
    await user.type(screen.getByLabelText('Alternativa 3'), 'Debênture sem mercado secundário');

    await user.click(screen.getByRole('button', { name: 'Remover alternativa 3' }));
    expect(screen.queryByLabelText('Alternativa 3')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Marcar alternativa 1 como correta' }));
    await user.type(screen.getByLabelText(/Explicação/), 'O Tesouro Selic permite resgate D+1.');

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      statement: 'Qual ativo tem liquidez diária?',
      options: [
        { text: 'Tesouro Selic', correct: true },
        { text: 'Imóvel residencial', correct: false },
      ],
      explanation: 'O Tesouro Selic permite resgate D+1.',
    });
  });
});

