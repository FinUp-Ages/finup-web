import { useState } from 'react';
import { useQuestionActions } from '../hooks/useQuestionActions';
import type { QuestionDTO, QuestionStatus } from '../types';
import { QuestionActionDialog, type QuestionActionKind } from './QuestionActionDialog';

interface QuestionStatusActionsProps {
  questionId: string;
  status: QuestionStatus;
  categoryId?: string;
  questionTitle?: string;
  onSuccess?: (action: QuestionActionKind, updated: QuestionDTO) => void;
  className?: string;
}

export function QuestionStatusActions({
  questionId,
  status,
  categoryId,
  questionTitle,
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

  const buttonClass =
    'inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[4px] border border-black/10 bg-white px-3 text-sm font-medium text-navy hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60';

  const discardButtonClass =
    'inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[4px] border border-login-error/20 bg-white px-3 text-sm font-medium text-login-error hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-login-error disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
        {/* DRAFT ou PUBLISHED_WITH_CHANGES pode publicar */}
        {(status === 'DRAFT' || status === 'PUBLISHED_WITH_CHANGES') && (
          <button
            type="button"
            onClick={() => openDialog('publish')}
            disabled={isAnyPending}
            className={buttonClass}
            
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
            className={buttonClass}
            
          >
            Voltar para rascunho
          </button>
        )}

        {/* Descartar alteracoes aparece SO com mudancas pendentes (PUBLISHED_WITH_CHANGES) */}
        {status === 'PUBLISHED_WITH_CHANGES' && (
          <button
            type="button"
            onClick={() => openDialog('discard')}
            disabled={isAnyPending}
            className={discardButtonClass}
            
          >
            Descartar alterações
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
