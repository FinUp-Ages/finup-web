import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { discardDraftQuestion } from '../api/discardDraftQuestion';
import { publishQuestion } from '../api/publishQuestion';
import { unpublishQuestion } from '../api/unpublishQuestion';
import type { QuestionDTO } from '../types';
import { QuestionStatusActions } from './QuestionStatusActions';

vi.mock('../api/publishQuestion', () => ({ publishQuestion: vi.fn() }));
vi.mock('../api/unpublishQuestion', () => ({ unpublishQuestion: vi.fn() }));
vi.mock('../api/discardDraftQuestion', () => ({ discardDraftQuestion: vi.fn() }));

function sampleDTO(status: QuestionDTO['status']): QuestionDTO {
  return {
    id: 'q-1',
    status,
    draft: {
      type: 'FILL_BLANK',
      title: 'Título da pergunta',
      statement: 'Enunciado ___',
      answers: ['teste'],
      explanation: '',
    },
    published:
      status === 'DRAFT'
        ? null
        : {
            type: 'FILL_BLANK',
            title: 'Título publicado',
            statement: 'Enunciado ___',
            answers: ['teste'],
            explanation: '',
          },
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: status === 'DRAFT' ? null : '2026-10-18T12:00:00Z',
  };
}

function renderActions(props: Parameters<typeof QuestionStatusActions>[0]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QuestionStatusActions {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(publishQuestion).mockReset();
  vi.mocked(unpublishQuestion).mockReset();
  vi.mocked(discardDraftQuestion).mockReset();
});

describe('QuestionStatusActions', () => {
  describe('Status DRAFT', () => {
    it('mostra botao Publicar e nao mostra Voltar para rascunho nem Descartar alteracoes', () => {
      renderActions({ questionId: 'q-1', status: 'DRAFT', questionTitle: 'Pergunta 1' });

      expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Voltar para rascunho' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Descartar alterações' })).not.toBeInTheDocument();
    });

    it('pede confirmacao antes de publicar e permite cancelar', async () => {
      const user = userEvent.setup();
      renderActions({ questionId: 'q-1', status: 'DRAFT', questionTitle: 'Pergunta 1' });

      await user.click(screen.getByRole('button', { name: 'Publicar' }));

      expect(screen.getByRole('heading', { name: 'Publicar pergunta?' })).toBeInTheDocument();
      expect(screen.getByText(/ficará visível e disponível para os alunos/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('heading', { name: 'Publicar pergunta?' })).not.toBeInTheDocument();
      expect(publishQuestion).not.toHaveBeenCalled();
    });

    it('publica com sucesso ao confirmar no modal', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const publishedDTO = sampleDTO('PUBLISHED');
      vi.mocked(publishQuestion).mockResolvedValue(publishedDTO);

      renderActions({
        questionId: 'q-1',
        status: 'DRAFT',
        questionTitle: 'Pergunta 1',
        onSuccess,
      });

      await user.click(screen.getByRole('button', { name: 'Publicar' }));
      const dialog = screen.getByRole('dialog');
      const confirmButton = screen.getAllByRole('button', { name: 'Publicar' }).find(
        (btn) => dialog.contains(btn),
      );
      expect(confirmButton).toBeDefined();
      await user.click(confirmButton!);

      expect(publishQuestion).toHaveBeenCalledWith('q-1');
      expect(onSuccess).toHaveBeenCalledWith('publish', publishedDTO);
    });
  });

  describe('Status PUBLISHED', () => {
    it('mostra botao Voltar para rascunho e nao mostra Publicar nem Descartar alteracoes', () => {
      renderActions({ questionId: 'q-1', status: 'PUBLISHED', questionTitle: 'Pergunta 1' });

      expect(screen.getByRole('button', { name: 'Voltar para rascunho' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Descartar alterações' })).not.toBeInTheDocument();
    });

    it('pede confirmacao e despublica ao confirmar', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const draftDTO = sampleDTO('DRAFT');
      vi.mocked(unpublishQuestion).mockResolvedValue(draftDTO);

      renderActions({
        questionId: 'q-1',
        status: 'PUBLISHED',
        questionTitle: 'Pergunta 1',
        onSuccess,
      });

      await user.click(screen.getByRole('button', { name: 'Voltar para rascunho' }));

      expect(screen.getByRole('heading', { name: 'Voltar para rascunho?' })).toBeInTheDocument();
      expect(screen.getByText(/deixará de estar visível para os alunos/)).toBeInTheDocument();

      const dialog = screen.getByRole('dialog');
      const confirmButton = screen.getAllByRole('button', { name: 'Voltar para rascunho' }).find(
        (btn) => dialog.contains(btn),
      );
      await user.click(confirmButton!);

      expect(unpublishQuestion).toHaveBeenCalledWith('q-1');
      expect(onSuccess).toHaveBeenCalledWith('unpublish', draftDTO);
    });
  });

  describe('Status PUBLISHED_WITH_CHANGES', () => {
    it('mostra Publicar, Voltar para rascunho e Descartar alteracoes', () => {
      renderActions({
        questionId: 'q-1',
        status: 'PUBLISHED_WITH_CHANGES',
        questionTitle: 'Pergunta 1',
      });

      expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Voltar para rascunho' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Descartar alterações' })).toBeInTheDocument();
    });

    it('pede confirmacao e descarta alteracoes pendentes revertendo o rascunho', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const revertedDTO = sampleDTO('PUBLISHED');
      vi.mocked(discardDraftQuestion).mockResolvedValue(revertedDTO);

      renderActions({
        questionId: 'q-1',
        status: 'PUBLISHED_WITH_CHANGES',
        questionTitle: 'Pergunta 1',
        onSuccess,
      });

      await user.click(screen.getByRole('button', { name: 'Descartar alterações' }));

      expect(screen.getByRole('heading', { name: 'Descartar alterações?' })).toBeInTheDocument();
      expect(screen.getByText(/As alterações não publicadas/)).toBeInTheDocument();

      const dialog = screen.getByRole('dialog');
      const confirmButton = screen.getAllByRole('button', { name: 'Descartar alterações' }).find(
        (btn) => dialog.contains(btn),
      );
      await user.click(confirmButton!);

      expect(discardDraftQuestion).toHaveBeenCalledWith('q-1');
      expect(onSuccess).toHaveBeenCalledWith('discard', revertedDTO);
    });
  });

  describe('Tratamento de erros', () => {
    it('exibe mensagem clara com role alert quando a publicacao falha com 400', async () => {
      const user = userEvent.setup();
      const error = new ApiError(400, {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'Rascunho incompleto para publicação.',
      });
      vi.mocked(publishQuestion).mockRejectedValue(error);

      renderActions({ questionId: 'q-1', status: 'DRAFT', questionTitle: 'Pergunta 1' });

      await user.click(screen.getByRole('button', { name: 'Publicar' }));
      const dialog = screen.getByRole('dialog');
      const confirmButton = screen.getAllByRole('button', { name: 'Publicar' }).find(
        (btn) => dialog.contains(btn),
      );
      await user.click(confirmButton!);

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Rascunho incompleto para publicação.');
      expect(screen.getByRole('heading', { name: 'Publicar pergunta?' })).toBeInTheDocument();
    });
  });
});
