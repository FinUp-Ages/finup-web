import { useId } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from './Dialog';
import { SecondaryButton } from './SecondaryButton';

export type QuestionActionKind = 'publish' | 'unpublish' | 'discard';

interface QuestionActionDialogProps {
  kind: QuestionActionKind;
  questionTitle?: string;
  isPending: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

const actionDetails: Record<
  QuestionActionKind,
  {
    title: string;
    description: (title?: string) => string;
    confirmLabel: string;
    pendingLabel: string;
    isDestructive?: boolean;
  }
> = {
  publish: {
    title: 'Publicar pergunta?',
    description: (title) =>
      title
        ? `A pergunta "${title}" ficará visível e disponível para os alunos na trilha de estudos.`
        : 'A pergunta ficará visível e disponível para os alunos na trilha de estudos.',
    confirmLabel: 'Publicar',
    pendingLabel: 'Publicando…',
  },
  unpublish: {
    title: 'Voltar para rascunho?',
    description: (title) =>
      title
        ? `A pergunta "${title}" deixará de estar visível para os alunos até ser publicada novamente.`
        : 'A pergunta deixará de estar visível para os alunos até ser publicada novamente.',
    confirmLabel: 'Voltar para rascunho',
    pendingLabel: 'Voltando…',
  },
  discard: {
    title: 'Descartar alterações?',
    description: (title) =>
      title
        ? `As alterações não publicadas da pergunta "${title}" serão descartadas e o rascunho voltará ao conteúdo da versão publicada. Essa ação não pode ser desfeita.`
        : 'As alterações não publicadas serão descartadas e o rascunho voltará ao conteúdo da versão publicada. Essa ação não pode ser desfeita.',
    confirmLabel: 'Descartar alterações',
    pendingLabel: 'Descartando…',
    isDestructive: true,
  },
};

export function QuestionActionDialog({
  kind,
  questionTitle,
  isPending,
  errorMessage,
  onConfirm,
  onClose,
}: QuestionActionDialogProps) {
  const id = useId();
  const config = actionDetails[kind];

  function close() {
    if (!isPending) {
      onClose();
    }
  }

  return (
    <Dialog titleId={`${id}-title`} onClose={close}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 id={`${id}-title`} className="text-xl font-semibold">
            {config.title}
          </h2>
          <p className="text-sm text-navy/80">{config.description(questionTitle)}</p>
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <SecondaryButton autoFocus onClick={close} disabled={isPending}>
            Cancelar
          </SecondaryButton>
          {config.isDestructive ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="inline-flex h-[55px] w-full cursor-pointer items-center justify-center rounded-full bg-login-error px-6 text-base leading-[21px] text-white hover:bg-login-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-login-error disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? config.pendingLabel : config.confirmLabel}
            </button>
          ) : (
            <Button type="button" onClick={onConfirm} disabled={isPending} className="px-6">
              {isPending ? config.pendingLabel : config.confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
