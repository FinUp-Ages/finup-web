import { useEffect, useRef, useState } from 'react';
import { EditWidgetsDialog } from '../components/EditWidgetsDialog';
import { widgetsIndicadores } from '../components/registroWidgetsIndicadores';
import { defaultWidgetsConfiguration, useDashboardWidgets } from '../hooks/useDashboardWidgets';

export function DashboardPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const { query, mutation } = useDashboardWidgets();

  // Apos salvar ou restaurar, o alerta ou o modal com o foco saem da tela; o foco vai para Editar.
  useEffect(() => {
    if (saved) editButtonRef.current?.focus();
  }, [saved]);

  // A configuracao em cache prevalece sobre erro de refetch; sem ela, a falha exibe o padrao.
  const readFailed = query.isError && !query.data;
  const configuration = query.data ?? (readFailed ? defaultWidgetsConfiguration : undefined);
  const visible =
    configuration?.widgets.filter(
      ({ id, enabled }) => enabled && widgetsIndicadores.some((widget) => widget.id === id),
    ) ?? [];

  return (
    <div className="flex items-start justify-center font-inter text-navy">
      <div className="flex w-full max-w-[1156px] flex-col gap-6">
        <header className="flex items-center justify-end">
          <button
            ref={editButtonRef}
            type="button"
            disabled={!query.data}
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
        ) : (
          <>
            {readFailed && (
              <div role="alert" className="rounded-lg bg-white p-6">
                <p>
                  Não foi possível carregar a configuração dos widgets. Exibindo os widgets padrão.
                </p>
                <p className="mt-1 text-sm">
                  Restaurar padrão substitui a configuração salva por todos os widgets ativos.
                </p>
                {mutation.isError && (
                  <p className="mt-1 text-sm text-error">
                    Não foi possível restaurar o padrão. Tente novamente.
                  </p>
                )}
                <div className="mt-3 flex gap-6">
                  <button
                    type="button"
                    disabled={query.isFetching || mutation.isPending}
                    onClick={() => {
                      void query.refetch();
                    }}
                    className="underline disabled:opacity-50"
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    disabled={query.isFetching || mutation.isPending}
                    onClick={() =>
                      mutation.mutate(defaultWidgetsConfiguration, {
                        onSuccess: () => setSaved(true),
                      })
                    }
                    className="underline disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Restaurando...' : 'Restaurar padrão'}
                  </button>
                </div>
              </div>
            )}
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
        {editing && query.data && (
          <EditWidgetsDialog
            configuration={query.data}
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
