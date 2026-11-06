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

  it('mantem bloco de codigo inteiro mesmo com linha em branco dentro dele', () => {
    const markdown = 'Antes\n\n```js\nconst a = 1;\n\nconst b = 2;\n```\n\nDepois';
    const { container } = render(<MarkdownPreview content={markdown} />);

    const blocks = container.querySelectorAll('pre');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].textContent).toBe('const a = 1;\n\nconst b = 2;');
    expect(screen.getByText('Antes')).toBeVisible();
    expect(screen.getByText('Depois')).toBeVisible();
  });

  it('nao cria link para protocolos inseguros', () => {
    render(<MarkdownPreview content="Clique [aqui](javascript:alert(1))" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/aqui/)).toBeVisible();
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
