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

  it('volta para "Escrever" e foca o corpo quando so o corpo e invalido na pre-visualizacao', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <LearningQuestionForm
        initialValues={{ title: 'Reserva', body: '' }}
        submitLabel="Salvar rascunho"
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Pré-visualizar' }));
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(screen.getByRole('tab', { name: 'Escrever' })).toHaveAttribute('aria-selected', 'true');
    const body = screen.getByRole('textbox', { name: /Corpo do conteúdo/ });
    expect(body).toBeVisible();
    expect(body).toHaveFocus();
    expect(body).toHaveAccessibleDescription(learningMessages.bodyRequired);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('mostra o campo do corpo e foca o titulo quando os dois sao invalidos na pre-visualizacao', async () => {
    const user = userEvent.setup();

    render(
      <LearningQuestionForm
        initialValues={{ title: '', body: '' }}
        submitLabel="Salvar rascunho"
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Pré-visualizar' }));
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: /Corpo do conteúdo/ })).toBeVisible();
    expect(screen.getByText(learningMessages.bodyRequired)).toBeVisible();
  });

  it('alterna as abas pelo teclado com as setas', async () => {
    const user = userEvent.setup();

    render(
      <LearningQuestionForm
        initialValues={{ title: 'Reserva', body: 'Texto' }}
        submitLabel="Salvar rascunho"
        onSubmit={vi.fn()}
      />,
    );

    const writeTab = screen.getByRole('tab', { name: 'Escrever' });
    const previewTab = screen.getByRole('tab', { name: 'Pré-visualizar' });
    expect(previewTab).toHaveAttribute('tabindex', '-1');

    writeTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(previewTab).toHaveFocus();
    expect(previewTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('Texto');

    await user.keyboard('{ArrowLeft}');
    expect(writeTab).toHaveFocus();
    expect(writeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('avisa quando ha edicoes nao salvas e quando elas sao desfeitas', async () => {
    const user = userEvent.setup();
    const handleDirtyChange = vi.fn();

    render(
      <LearningQuestionForm
        initialValues={{ title: 'Reserva', body: 'Texto' }}
        submitLabel="Salvar rascunho"
        onSubmit={vi.fn()}
        onDirtyChange={handleDirtyChange}
      />,
    );

    expect(handleDirtyChange).toHaveBeenLastCalledWith(false);
    const title = screen.getByRole('textbox', { name: 'Título' });
    await user.type(title, '!');
    expect(handleDirtyChange).toHaveBeenLastCalledWith(true);
    await user.type(title, '{Backspace}');
    expect(handleDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('nao envia enquanto o rascunho esta salvando', () => {
    const handleSubmit = vi.fn();

    render(
      <LearningQuestionForm
        initialValues={{ title: 'Reserva', body: 'Texto' }}
        submitLabel="Salvar rascunho"
        isSaving
        onSubmit={handleSubmit}
      />,
    );

    const button = screen.getByRole('button', { name: 'Salvando...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    button.closest('form')?.requestSubmit();
    expect(handleSubmit).not.toHaveBeenCalled();
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
