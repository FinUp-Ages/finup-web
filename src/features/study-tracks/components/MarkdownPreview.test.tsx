import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

describe('MarkdownPreview', () => {
  it('exibe mensagem quando o conteudo estiver vazio', () => {
    render(<MarkdownPreview content="" />);
    expect(
      screen.getByText(/Nada para pré-visualizar/),
    ).toBeInTheDocument();
  });

  it('renderiza titulos, negrito, italico e listas', () => {
    const markdown = [
      '# Título Principal',
      '## Subtítulo',
      'Texto com **destaque em negrito** e *termo em itálico*.',
      '- Item um',
      '- Item dois',
    ].join('\n\n');

    render(<MarkdownPreview content={markdown} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Título Principal' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Subtítulo' })).toBeVisible();
    expect(screen.getByText('destaque em negrito')).toBeVisible();
    expect(screen.getByText('termo em itálico')).toBeVisible();
    expect(screen.getByText('Item um')).toBeVisible();
    expect(screen.getByText('Item dois')).toBeVisible();
  });

  it('renderiza bloco de codigo e inline code', () => {
    const markdown = 'Exemplo com `const x = 10;` inline:\n\n```\nconst a = 1;\nconst b = 2;\n```';
    render(<MarkdownPreview content={markdown} />);

    expect(screen.getByText('const x = 10;')).toBeVisible();
    expect(screen.getByText(/const a = 1;/)).toBeVisible();
  });

  it('renderiza citacao e links com seguranca', () => {
    const markdown = '> Nota de atencao\n\nVisite o [FinUp](https://finup.com.br)';
    render(<MarkdownPreview content={markdown} />);

    expect(screen.getByText('Nota de atencao')).toBeVisible();
    const link = screen.getByRole('link', { name: 'FinUp' });
    expect(link).toHaveAttribute('href', 'https://finup.com.br');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
