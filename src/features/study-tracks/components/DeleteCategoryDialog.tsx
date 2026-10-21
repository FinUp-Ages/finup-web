/** Confirmacao de remocao. O 409 (categoria com perguntas) aparece aqui, sem fechar o modal. */
import { useId } from 'react';
import type { CategoryDTO } from '../types';
import { Dialog } from './Dialog';
import { SecondaryButton } from './SecondaryButton';

interface DeleteCategoryDialogProps {
  category: CategoryDTO;
  isRemoving: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteCategoryDialog({
  category,
  isRemoving,
  errorMessage,
  onConfirm,
  onClose,
}: DeleteCategoryDialogProps) {
  const id = useId();

  function close() {
    if (!isRemoving) {
      onClose();
    }
  }

  return (
    <Dialog titleId={`${id}-title`} onClose={close}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 id={`${id}-title`} className="text-xl font-semibold">
            Remover categoria?
          </h2>
          <p className="text-sm">
            A categoria <strong className="font-semibold">“{category.name}”</strong> será removida.
            Essa ação não pode ser desfeita.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* O foco comeca em Cancelar: a acao destrutiva exige um passo a mais. */}
          <SecondaryButton autoFocus onClick={close} disabled={isRemoving}>
            Cancelar
          </SecondaryButton>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="inline-flex h-[55px] w-full cursor-pointer items-center justify-center rounded-full bg-login-error px-10 text-base leading-[21px] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-login-error disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRemoving ? 'Removendo…' : 'Remover'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
