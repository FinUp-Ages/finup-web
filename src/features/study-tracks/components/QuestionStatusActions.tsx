import { useId, useState } from 'react';
import { useQuestionActions } from '../hooks/useQuestionActions';
import type { QuestionDTO, QuestionStatus } from '../types';
import { QuestionActionDialog, type QuestionActionKind } from './QuestionActionDialog';

interface QuestionStatusActionsProps {
  questionId: string;
  status: QuestionStatus;
  categoryId?: string;
  questionTitle?: string;
  /** Quando informado, as acoes ficam desabilitadas e o motivo aparece abaixo dos botoes. */
  disabledReason?: string | null;
  onSuccess?: (action: QuestionActionKind, updated: QuestionDTO) => void;
  className?: string;
}

const actionButtonBase =
  'inline-flex h-[36px] whitespace-nowrap cursor-pointer items-center justify-center rounded-[4px] border text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors';

// Publicar: botao primario na cor navy institucional do FinUp.
const publishButtonClass = `${actionButtonBase} border-transparent bg-navy px-3.5 text-white shadow-sm hover:bg-navy/90 focus-visible:outline-navy`;

// Voltar para rascunho: botao neutro.
const unpublishButtonClass = `${actionButtonBase} border-black/10 bg-white px-3 text-navy/80 hover:bg-slate-50 hover:text-navy focus-visible:outline-navy`;

// Descartar alteracoes: botao de alerta.
const discardButtonClass = `${actionButtonBase} border-login-error/25 bg-white px-3 text-login-error hover:bg-red-50 hover:border-login-error/50 focus-visible:outline-login-error`;

export function QuestionStatusActions({
  questionId,
  status,
  categoryId,
  questionTitle,
  disabledReason = null,
  onSuccess,
  className = '',
}: QuestionStatusActionsProps) {
  const [activeDialog, setActiveDialog] = useState<QuestionActionKind | null>(null);
  const disabledReasonId = useId();

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

  const isDisabled = isAnyPending || Boolean(disabledReason);
  const describedBy = disabledReason ? disabledReasonId : undefined;

  return (
    <>
      <div className={`flex flex-col items-end gap-1 ${className}`.trim()}>
        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          {/* DRAFT ou PUBLISHED_WITH_CHANGES pode publicar */}
          {(status === 'DRAFT' || status === 'PUBLISHED_WITH_CHANGES') && (
            <button
              type="button"
              onClick={() => openDialog('publish')}
              disabled={isDisabled}
              aria-describedby={describedBy}
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
              disabled={isDisabled}
              aria-describedby={describedBy}
              className={unpublishButtonClass}
            >
              Voltar para rascunho
            </button>
          )}

          {/* Descartar alteracoes aparece SO com mudancas pendentes (PUBLISHED_WITH_CHANGES) */}
          {status === 'PUBLISHED_WITH_CHANGES' && (
            <button
              type="button"
              onClick={() => openDialog('discard')}
              disabled={isDisabled}
              aria-describedby={describedBy}
              className={discardButtonClass}
            >
              Descartar alterações
            </button>
          )}
        </div>

        {disabledReason && (
          <p id={disabledReasonId} className="text-xs text-navy/70">
            {disabledReason}
          </p>
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
