/**
 * Tela de categorias da Trilha de estudos (/app/studies): lista, cria, edita e remove (C6).
 */
import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { CategoriesTable } from '../components/CategoriesTable';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { DeleteCategoryDialog } from '../components/DeleteCategoryDialog';
import { useCategories } from '../hooks/useCategories';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { useSaveCategory } from '../hooks/useSaveCategory';
import type { CategoryDTO, CategoryPayload } from '../types';

type OpenDialog =
  | { kind: 'create' }
  | { kind: 'edit'; category: CategoryDTO }
  | { kind: 'delete'; category: CategoryDTO };

type StudyCategoriesPageProps = {
  questionsPathFor: (categoryId: string) => string;
};

export function StudyCategoriesPage({ questionsPathFor }: StudyCategoriesPageProps) {
  const { categories, isLoading, errorMessage, reload } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingOnClose = useRef(false);

  // O botao que abriu o modal de remocao sai da tabela: o foco vai para o titulo da tela.
  // Roda depois da limpeza do Dialog, que devolve o foco ao botao.
  useEffect(() => {
    if (!dialog && focusHeadingOnClose.current) {
      focusHeadingOnClose.current = false;
      headingRef.current?.focus();
    }
  }, [dialog]);

  function openDialog(next: OpenDialog) {
    saveCategory.reset();
    deleteCategory.reset();
    setSuccessMessage(null);
    setDialog(next);
  }

  function handleSave(values: CategoryPayload) {
    const categoryId = dialog?.kind === 'edit' ? dialog.category.id : undefined;
    saveCategory.save({ categoryId, values }, (saved) => {
      setDialog(null);
      setSuccessMessage(
        categoryId ? `Categoria “${saved.name}” atualizada.` : `Categoria “${saved.name}” criada.`,
      );
    });
  }

  function handleRemove(category: CategoryDTO) {
    deleteCategory.remove(category.id, () => {
      focusHeadingOnClose.current = true;
      setDialog(null);
      setSuccessMessage(`Categoria “${category.name}” removida.`);
    });
  }

  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full min-w-[720px] max-w-[1171px] flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-[0.32px] outline-none"
            >
              Trilha de estudos
            </h1>
            <p className="text-sm text-navy/60">
              Categorias que agrupam as perguntas da trilha no app.
            </p>
          </div>
          <div className="w-[220px] shrink-0">
            <Button type="button" onClick={() => openDialog({ kind: 'create' })}>
              <Plus aria-hidden="true" size={20} />
              Nova categoria
            </Button>
          </div>
        </header>

        {/* Sempre no DOM para o leitor de tela anunciar a mensagem quando ela aparece. */}
        <div role="status" aria-live="polite">
          {successMessage && (
            <div className="flex items-center justify-between gap-4 rounded-[4px] border border-[#3EA54E]/30 bg-[#EBF6ED] px-4 py-3 text-sm text-[#2B7A37]">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                aria-label="Fechar mensagem"
                className="rounded-[4px] p-1 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center rounded-[4px] border border-black/5 text-sm text-navy/60">
            Carregando categorias…
          </div>
        ) : errorMessage ? (
          <div
            role="alert"
            className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-[4px] border border-red-200 bg-red-50 text-sm text-red-700"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-[4px] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-[4px] border border-black/5 text-sm text-navy/60">
            <p className="font-semibold text-navy">Nenhuma categoria cadastrada.</p>
            <p>Crie a primeira categoria para começar a montar a trilha.</p>
          </div>
        ) : (
          <CategoriesTable
            categories={categories}
            questionsPathFor={questionsPathFor}
            onEdit={(category) => openDialog({ kind: 'edit', category })}
            onRemove={(category) => openDialog({ kind: 'delete', category })}
          />
        )}
      </section>

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <CategoryFormDialog
          category={dialog.kind === 'edit' ? dialog.category : undefined}
          isSaving={saveCategory.isSaving}
          errorMessage={saveCategory.errorMessage}
          onSubmit={handleSave}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'delete' && (
        <DeleteCategoryDialog
          category={dialog.category}
          isRemoving={deleteCategory.isRemoving}
          errorMessage={deleteCategory.errorMessage}
          onConfirm={() => handleRemove(dialog.category)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
