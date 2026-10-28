import { useState } from 'react';
import { useQuestionActions } from '../hooks/useQuestionActions';
import type { QuestionDTO, QuestionStatus } from '../types';
import { QuestionActionDialog, type QuestionActionKind } from './QuestionActionDialog';

interface QuestionStatusActionsProps {
  questionId: string;
  status: QuestionStatus;
  categoryId?: string;
  questionTitle?: string;
  compact?: boolean;
  onSuccess?: (action: QuestionActionKind, updated: QuestionDTO) => void;
  className?: string;
}

export function QuestionStatusActions({
  questionId,
  status,
  categoryId,
  questionTitle,
  compact = false,
  onSuccess,
  className = '',
}: QuestionStatusActionsProps) {
  const [activeDialog, setActiveDialog] = useState<QuestionActionKind | null>(null);

  const {
    publish,
    isPublishing,
    publishError,
    resetPublishError,

    unpublish,
    isUnpublishing,
    unpublishError,
    resetUnpublishError,

    discardDraft,
    isDiscarding,
    discardError,
    resetDiscardError,

    isAnyPending,
  } = useQuestionActions({ categoryId });

  function openDialog(kind: QuestionActionKind) {
    resetPublishError();
    resetUnpublishError();
    resetDiscardError();
    setActiveDialog(kind);
  }

  function handleConfirm() {
    if (!activeDialog) return;

    if (activeDialog === 'publish') {
      publish(questionId, (updated) => {
        setActiveDialog(null);
        onSuccess?.('publish', updated);
      });
    } else if (activeDialog === 'unpublish') {
      unpublish(questionId, (updated) => {
        setActiveDialog(null);
        onSuccess?.('unpublish', updated);
      });
    } else if (activeDialog === 'discard') {
      discardDraft(questionId, (updated) => {
        setActiveDialog(null);
        onSuccess?.('discard', updated);
      });
    }
  }

  const isPending =
    activeDialog === 'publish'
      ? isPublishing
      : activeDialog === 'unpublish'
        ? isUnpublishing
        : activeDialog === 'discard'
          ? isDiscarding
          : isAnyPending;

  const currentError =
    activeDialog === 'publish'
      ? publishError
      : activeDialog === 'unpublish'
        ? unpublishError
        : activeDialog === 'discard'
          ? discardError
          : null;

  // Botao primario para Publicar: cor navy institucional do FinUp
  const publishButtonClass =
    'inline-flex h-[36px] whitespace-nowrap cursor-pointer items-center justify-center rounded-[4px] border border-transparent bg-navy px-3.5 text-sm font-medium text-white shadow-sm hover:bg-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60 transition-colors';

  // Botao neutro para Voltar para rascunho / Despublicar
  const unpublishButtonClass =
    'inline-flex h-[36px] whitespace-nowrap cursor-pointer items-center justify-center rounded-[4px] border border-black/10 bg-white px-3 text-sm font-medium text-navy/80 hover:bg-slate-50 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60 transition-colors';

  // Botao de alerta para Descartar alteracoes
  const discardButtonClass =
    'inline-flex h-[36px] whitespace-nowrap cursor-pointer items-center justify-center rounded-[4px] border border-login-error/25 bg-white px-3 text-sm font-medium text-login-error hover:bg-red-50 hover:border-login-error/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-login-error disabled:cursor-not-allowed disabled:opacity-60 transition-colors';

  const unpublishLabel = compact ? 'Despublicar' : 'Voltar para rascunho';
  const discardLabel = compact ? 'Descartar' : 'Descartar alterações';

  return (
    <>
      <div className={`inline-flex items-center gap-2 whitespace-nowrap ${className}`.trim()}>
        {/* DRAFT ou PUBLISHED_WITH_CHANGES pode publicar */}
        {(status === 'DRAFT' || status === 'PUBLISHED_WITH_CHANGES') && (
          <button
            type="button"
            onClick={() => openDialog('publish')}
            disabled={isAnyPending}
            className={publishButtonClass}
          >
            Publicar
          </button>
        )}

        {/* PUBLISHED ou PUBLISHED_WITH_CHANGES pode voltar para rascunho */}
        {(status === 'PUBLISHED' || status === 'PUBLISHED_WITH_CHANGES') && (
          <button
            type="button"
            onClick={() => openDialog('unpublish')}
            disabled={isAnyPending}
            className={unpublishButtonClass}
            title="Voltar para rascunho (despublicar)"
            aria-label="Voltar para rascunho"
          >
            {unpublishLabel}
          </button>
        )}

        {/* Descartar alteracoes aparece SO com mudancas pendentes (PUBLISHED_WITH_CHANGES) */}
        {status === 'PUBLISHED_WITH_CHANGES' && (
          <button
            type="button"
            onClick={() => openDialog('discard')}
            disabled={isAnyPending}
            className={discardButtonClass}
            title="Descartar alterações pendentes no rascunho"
            aria-label="Descartar alterações"
          >
            {discardLabel}
          </button>
        )}
      </div>

      {activeDialog && (
        <QuestionActionDialog
          kind={activeDialog}
          questionTitle={questionTitle}
          isPending={isPending}
          errorMessage={currentError}
          onConfirm={handleConfirm}
          onClose={() => setActiveDialog(null)}
        />
      )}
    </>
  );
}
