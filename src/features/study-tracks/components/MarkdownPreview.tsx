import { type ReactNode } from 'react';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

/**
 * Converte spans inline de markdown (negrito, itálico, código, links) em elementos React seguros.
 * Não utiliza dangerouslySetInnerHTML, prevenindo completamente vulnerabilidades XSS.
 */
function parseInline(text: string): ReactNode[] {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs font-semibold text-navy"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-navy">
          {parseInline(part.slice(2, -2))}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className="italic">
          {parseInline(part.slice(1, -1))}
        </em>
      );
    }

    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (linkMatch) {
      const [, linkText, href] = linkMatch;
      const isSafe = /^https?:\/\//i.test(href) || href.startsWith('/');
      return (
        <a
          key={index}
          href={isSafe ? href : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-navy underline hover:text-navy/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
        >
          {linkText}
        </a>
      );
    }

    return part;
  });
}

/** Renderiza um bloco simples de markdown de forma tipada e segura. */
function renderBlock(block: string, index: number): ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // Bloco de código
  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    const lines = trimmed.slice(3, -3).split('\n');
    const code = (lines[0]?.trim() ? lines.slice(1) : lines).join('\n');
    return (
      <pre
        key={index}
        className="my-3 overflow-x-auto rounded-[4px] border border-black/10 bg-black/[0.03] p-3 font-mono text-xs leading-relaxed text-navy"
      >
        <code>{code}</code>
      </pre>
    );
  }

  // Títulos: se houver quebra de linha após o título, renderiza o header e o restante
  if (/^#{1,4}\s/.test(trimmed)) {
    const [headerLine, ...remainingLines] = trimmed.split('\n');
    const level = headerLine.match(/^(#{1,4})\s/)?.[1].length ?? 1;
    const headerText = headerLine.replace(/^#{1,4}\s+/, '');

    const HeaderTag = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
    const classes =
      level === 1
        ? 'mb-2 mt-4 text-2xl font-semibold tracking-[0.32px] text-navy'
        : level === 2
          ? 'mb-2 mt-3 text-xl font-semibold tracking-[0.32px] text-navy'
          : level === 3
            ? 'mb-1 mt-3 text-lg font-semibold text-navy'
            : 'mb-1 mt-2 text-base font-semibold text-navy';

    return (
      <div key={index}>
        <HeaderTag className={classes}>{parseInline(headerText)}</HeaderTag>
        {remainingLines.length > 0 && renderBlock(remainingLines.join('\n'), index + 1000)}
      </div>
    );
  }

  // Citação (Blockquote)
  if (trimmed.startsWith('>')) {
    const quoteContent = trimmed
      .split('\n')
      .map((line) => line.replace(/^>\s?/, ''))
      .join('\n');
    return (
      <blockquote
        key={index}
        className="my-3 border-l-4 border-navy/30 pl-3 italic text-navy/80"
      >
        {parseInline(quoteContent)}
      </blockquote>
    );
  }

  const lines = trimmed.split('\n');

  // Lista não-ordenada
  if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
    return (
      <ul key={index} className="my-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-navy">
        {lines.map((line, liIndex) => (
          <li key={liIndex}>{parseInline(line.trim().replace(/^[-*]\s+/, ''))}</li>
        ))}
      </ul>
    );
  }

  // Lista ordenada
  if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
    return (
      <ol
        key={index}
        className="my-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-navy"
      >
        {lines.map((line, liIndex) => (
          <li key={liIndex}>{parseInline(line.trim().replace(/^\d+\.\s+/, ''))}</li>
        ))}
      </ol>
    );
  }

  // Parágrafo padrão
  return (
    <p key={index} className="my-2 text-sm leading-relaxed text-navy whitespace-pre-line">
      {parseInline(trimmed)}
    </p>
  );
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  if (!content || !content.trim()) {
    return (
      <div
        className={`flex min-h-[140px] items-center justify-center rounded-md border border-dashed border-black/15 bg-white p-6 text-center text-sm italic text-navy/50 ${className}`}
      >
        Nada para pré-visualizar. Digite o conteúdo em markdown para ver a renderização.
      </div>
    );
  }

  const blocks = content.split(/\n\s*\n/);

  return (
    <div
      className={`min-h-[140px] rounded-md border border-black/10 bg-white p-5 text-navy ${className}`}
      data-testid="markdown-preview"
    >
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
