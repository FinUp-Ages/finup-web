import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { widgetsIndicadores } from './registroWidgetsIndicadores';
import type { DashboardWidgetsDTO } from '../model/widgetTypes';

interface Props {
  configuration: DashboardWidgetsDTO;
  saving: boolean;
  error: boolean;
  onSave: (configuration: DashboardWidgetsDTO) => void;
  onClose: () => void;
}

const controlClass =
  'rounded p-2 text-navy hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-30';

export function EditWidgetsDialog({ configuration, saving, error, onSave, onClose }: Props) {
  const titleId = useId();
  const [draft, setDraft] = useState(() => configuration.widgets.map((widget) => ({ ...widget })));
  const visible = draft.filter(({ id }) => widgetsIndicadores.some((widget) => widget.id === id));

  function move(id: string, direction: number) {
    const index = visible.findIndex((widget) => widget.id === id);
    const adjacent = visible[index + direction];
    if (!adjacent) return;
    setDraft((current) => {
      const next = [...current];
      const from = next.findIndex((widget) => widget.id === id);
      const to = next.findIndex((widget) => widget.id === adjacent.id);
      [next[from], next[to]] = [next[to], next[from]];
      return next.map((widget, position) => ({ ...widget, position }));
    });
  }

  return (
    <Dialog
      titleId={titleId}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form
        className="flex flex-col gap-6 font-inter"
        onSubmit={(event) => {
          event.preventDefault();
          if (!saving) onSave({ widgets: draft });
        }}
      >
        <header className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-semibold">
            Editar widgets
          </h2>
          <button
            type="button"
            aria-label="Fechar edição de widgets"
            onClick={onClose}
            disabled={saving}
            className={controlClass}
          >
            <X size={20} />
          </button>
        </header>
        <p className="text-sm">
          Escolha os widgets que deseja exibir e ajuste a ordem pelas setas.
        </p>
        <ol
          aria-label="Ordem dos widgets"
          className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto"
        >
          {visible.map((widget, index) => {
            const registered = widgetsIndicadores.find(({ id }) => id === widget.id)!;
            return (
              <li
                key={widget.id}
                className="flex items-center gap-3 rounded-lg border border-navy/15 p-3"
              >
                <span aria-hidden="true" className="text-sm text-navy/60">
                  {index + 1}
                </span>
                <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    disabled={saving}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setDraft((current) =>
                        current.map((item) =>
                          item.id === widget.id ? { ...item, enabled } : item,
                        ),
                      );
                    }}
                    className="h-4 w-4 accent-navy"
                  />
                  {registered.titulo}
                </label>
                <button
                  type="button"
                  className={controlClass}
                  disabled={saving || index === 0}
                  aria-label={`Mover ${registered.titulo} para cima`}
                  onClick={() => move(widget.id, -1)}
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  type="button"
                  className={controlClass}
                  disabled={saving || index === visible.length - 1}
                  aria-label={`Mover ${registered.titulo} para baixo`}
                  onClick={() => move(widget.id, 1)}
                >
                  <ArrowDown size={18} />
                </button>
              </li>
            );
          })}
        </ol>
        {!visible.some(({ enabled }) => enabled) && (
          <p className="text-sm">
            Nenhum widget será exibido. Você poderá ativá-los novamente neste editor.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-error">
            Não foi possível salvar os widgets. Tente novamente.
          </p>
        )}
        <footer className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className={controlClass}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-navy px-5 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
