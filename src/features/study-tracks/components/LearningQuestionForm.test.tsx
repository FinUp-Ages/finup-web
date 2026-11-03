import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { learningMessages } from '../model/learningValidation';
import { LearningQuestionForm } from './LearningQuestionForm';

describe('LearningQuestionForm', () => {
  it('valida campos obrigatorios e foca o primeiro invalido', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <LearningQuestionForm
        initialValues={{ title: '', body: '' }}
        submitLabel="Salvar rascunho"
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(screen.getByText(learningMessages.titleRequired)).toBeVisible();
    expect(screen.getByText(learningMessages.bodyRequired)).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveFocus();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('permite alternar entre abas Escrever e Pré-visualizar', async () => {
    const user = userEvent.setup();

    render(
      <LearningQuestionForm
        initialValues={{
          title: 'Reserva',
          body: '# Título Markdown\nTexto com **negrito**.',
        }}
        submitLabel="Salvar rascunho"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Escrever' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('textbox', { name: /Corpo do conteúdo/ })).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Pré-visualizar' }));

    expect(screen.getByRole('tab', { name: 'Pré-visualizar' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 1, name: 'Título Markdown' })).toBeVisible();
    expect(screen.getByText('negrito')).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Escrever' }));
    expect(screen.getByRole('textbox', { name: /Corpo do conteúdo/ })).toBeVisible();
  });

  it('submete os valores quando validos', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <LearningQuestionForm
        initialValues={{ title: '', body: '' }}
        submitLabel="Salvar rascunho"
        onSubmit={handleSubmit}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Como poupar dinheiro');
    await user.type(
      screen.getByRole('textbox', { name: /Corpo do conteúdo/ }),
      'Economize pelo menos **10%** da sua renda.',
    );

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      title: 'Como poupar dinheiro',
      body: 'Economize pelo menos **10%** da sua renda.',
    });
  });
});
