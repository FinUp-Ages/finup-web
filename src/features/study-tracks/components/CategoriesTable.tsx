import type { CategoryDTO } from '../types';

interface CategoriesTableProps {
  categories: CategoryDTO[];
  onEdit: (category: CategoryDTO) => void;
  onRemove: (category: CategoryDTO) => void;
}

const actionClassName =
  'h-[42px] rounded-[4px] border border-black/10 bg-white px-3 text-navy hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy';

const countFormat = new Intl.NumberFormat('pt-BR');

export function CategoriesTable({ categories, onEdit, onRemove }: CategoriesTableProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-black/5 bg-white">
      <table className="w-full table-fixed border-collapse text-left text-base tracking-[0.32px] text-navy">
        <caption className="sr-only">Categorias da trilha de estudos</caption>
        <colgroup>
          <col className="w-[24%]" />
          <col />
          <col className="w-[130px]" />
          <col className="w-[130px]" />
          <col className="w-[200px]" />
        </colgroup>
        <thead>
          <tr className="h-[57px] border-b border-black/5">
            <th scope="col" className="px-4 font-normal">
              NOME
            </th>
            <th scope="col" className="px-4 font-normal">
              DESCRIÇÃO
            </th>
            <th scope="col" className="px-4 text-right font-normal">
              RASCUNHOS
            </th>
            <th scope="col" className="px-4 text-right font-normal">
              PUBLICADAS
            </th>
            <th scope="col" className="px-4 font-normal">
              AÇÕES
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="h-[75px] border-b border-black/5 last:border-b-0">
              <th scope="row" className="truncate px-4 font-semibold" title={category.name}>
                {category.name}
              </th>
              <td className="truncate px-4" title={category.description || undefined}>
                {category.description || (
                  <span className="text-navy/40">
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">Sem descrição</span>
                  </span>
                )}
              </td>
              <td className="px-4 text-right tabular-nums">
                {countFormat.format(category.draftCount)}
              </td>
              <td className="px-4 text-right tabular-nums">
                {countFormat.format(category.publishedCount)}
              </td>
              <td className="px-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label={`Editar categoria ${category.name}`}
                    className={actionClassName}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(category)}
                    aria-label={`Remover categoria ${category.name}`}
                    className={actionClassName}
                  >
                    Remover
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
