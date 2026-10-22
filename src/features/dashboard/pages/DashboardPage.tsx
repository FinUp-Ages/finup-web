import { useState } from 'react';
import { EditWidgetsDialog } from '../components/EditWidgetsDialog';
import { widgetsIndicadores } from '../components/registroWidgetsIndicadores';
import { useDashboardWidgets } from '../hooks/useDashboardWidgets';

export function DashboardPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const { query, mutation } = useDashboardWidgets();
  const configuration = query.data;
  const visible =
    configuration?.widgets.filter(
      ({ id, enabled }) => enabled && widgetsIndicadores.some((widget) => widget.id === id),
    ) ?? [];

  return (
    <div className="flex items-start justify-center font-inter text-navy">
      <div className="flex w-full max-w-[1156px] flex-col gap-6">
        <header className="flex items-center justify-end">
          <button
            type="button"
            disabled={!configuration || query.isError}
            onClick={() => {
              mutation.reset();
              setSaved(false);
              setEditing(true);
            }}
            className="rounded text-center text-base font-semibold tracking-[0.32px] text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-50"
          >
            Editar widgets
          </button>
        </header>
        {query.isPending ? (
          <p role="status">Carregando configuração dos widgets...</p>
        ) : query.isError ? (
          <div role="alert" className="rounded-lg bg-white p-6">
            <p>Não foi possível carregar a configuração dos widgets.</p>
            <button
              type="button"
              onClick={() => {
                void query.refetch();
              }}
              className="mt-3 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {saved && (
              <p role="status" className="text-sm">
                Configuração dos widgets salva.
              </p>
            )}
            {visible.length === 0 ? (
              <p className="rounded-lg bg-white p-6">
                Nenhum widget ativo. Use “Editar widgets” para escolher o que exibir.
              </p>
            ) : (
              <div className="flex flex-wrap items-start gap-6">
                {visible.map(({ id }) => {
                  const { Componente, largura } = widgetsIndicadores.find(
                    (widget) => widget.id === id,
                  )!;
                  return (
                    <div key={id} className={largura === 'completa' ? 'w-full' : 'w-[271px]'}>
                      <Componente />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {editing && configuration && (
          <EditWidgetsDialog
            configuration={configuration}
            saving={mutation.isPending}
            error={mutation.isError}
            onClose={() => {
              if (!mutation.isPending) setEditing(false);
            }}
            onSave={(next) =>
              mutation.mutate(next, {
                onSuccess: () => {
                  setEditing(false);
                  setSaved(true);
                },
              })
            }
          />
        )}
      </div>
    </div>
  );
}
