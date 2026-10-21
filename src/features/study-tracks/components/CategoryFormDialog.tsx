/** Modal de criacao e edicao de categoria: nome obrigatorio e descricao opcional. */
import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { validateCategory, type CategoryErrors } from '../model/categoryValidation';
import type { CategoryDTO, CategoryPayload } from '../types';
import { Dialog } from './Dialog';
import { SecondaryButton } from './SecondaryButton';

interface CategoryFormDialogProps {
  /** Categoria em edicao; ausente na criacao. */
  category?: CategoryDTO;
  isSaving: boolean;
  errorMessage: string | null;
  onSubmit: (values: CategoryPayload) => void;
  onClose: () => void;
}

export function CategoryFormDialog({
  category,
  isSaving,
  errorMessage,
  onSubmit,
  onClose,
}: CategoryFormDialogProps) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<CategoryPayload>({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });
  const [errors, setErrors] = useState<CategoryErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCategory(values);
    setErrors(nextErrors);
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    onSubmit(values);
  }

  function close() {
    if (!isSaving) {
      onClose();
    }
  }

  return (
    <Dialog titleId={`${id}-title`} onClose={close}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          {category ? 'Editar categoria' : 'Nova categoria'}
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-name`} className="text-sm font-semibold">
              Nome <span aria-hidden="true">*</span>
            </label>
            <Input
              ref={nameRef}
              id={`${id}-name`}
              autoFocus
              required
              value={values.name}
              onChange={(event) => {
                setValues((current) => ({ ...current, name: event.target.value }));
                setErrors({});
              }}
              placeholder="Ex.: Reserva de emergência"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              disabled={isSaving}
            />
            {errors.name && (
              <p id={`${id}-name-error`} className="text-sm text-login-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-description`} className="text-sm font-semibold">
              Descrição <span className="font-normal text-navy/60">(opcional)</span>
            </label>
            <textarea
              id={`${id}-description`}
              rows={4}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Sobre o que são as perguntas desta categoria"
              disabled={isSaving}
              className="w-full resize-none rounded-md border-0 bg-login-field px-5 py-4 text-sm leading-[18px] text-black outline-none placeholder:text-black/60 focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <SecondaryButton onClick={close} disabled={isSaving}>
            Cancelar
          </SecondaryButton>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
