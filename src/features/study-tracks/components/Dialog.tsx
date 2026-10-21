/**
 * Modal da feature sobre o <dialog> nativo: showModal() prende o foco dentro do modal, Esc fecha
 * e, ao desmontar, o foco volta para o botao que abriu. Renderize so enquanto estiver aberto.
 */
import { useEffect, useRef, type PropsWithChildren } from 'react';

type DialogProps = PropsWithChildren<{
  /** id do titulo do modal (aria-labelledby). */
  titleId: string;
  /** Esc chama onClose; quem usa decide se pode fechar (ex.: nao fecha enquanto salva). */
  onClose: () => void;
}>;

export function Dialog({ titleId, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    // Na desmontagem o <dialog> ja saiu do DOM e o navegador nao devolve o foco sozinho.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="w-full max-w-[520px] rounded-[4px] bg-white p-6 text-navy shadow-xl backdrop:bg-navy/40"
    >
      {children}
    </dialog>
  );
}
