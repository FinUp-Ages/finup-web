import { useDeferredValue, useEffect, useState } from 'react';
import { UsersTable } from '../components/UsersTable';
import { useUsers } from '../hooks/useUsers';
import type { UserStatus } from '../types';

const pageSize = 20;

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { users, totalElements, totalPages, isLoading, isFetching, errorMessage, reload } =
    useUsers({
      page,
      size: pageSize,
      status: status || undefined,
      // Busca vazia nao vai para a API (undefined e omitido pelo Axios).
      search: deferredSearch.trim() || undefined,
    });

  // O total pode encolher entre uma busca e outra: volta para a ultima pagina que existe.
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const firstResult = totalElements === 0 ? 0 : page * pageSize + 1;
  const lastResult = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full min-w-[720px] max-w-[1171px] flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-[0.32px]">Usuários</h1>
          <button
            type="button"
            aria-label="Mais ações"
            className="h-10 w-10 rounded-[4px] border border-black/10 bg-white text-navy hover:bg-slate-50"
          >
            <span aria-hidden="true">•••</span>
          </button>
        </header>

        <div className="flex items-center gap-3">
          <label htmlFor="users-search" className="sr-only">
            Buscar usuário
          </label>
          <input
            id="users-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Buscar por nome ou e-mail"
            className="h-11 w-[360px] rounded-[4px] border border-black/10 bg-white px-3 text-sm text-navy outline-none placeholder:text-navy/50 focus:border-navy"
          />
          <label htmlFor="users-status" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="users-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as UserStatus | '');
              setPage(0);
            }}
            className="h-11 rounded-[4px] border border-black/10 bg-white px-3 text-sm text-navy outline-none focus:border-navy"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>
          {isFetching && !isLoading && <span className="text-xs text-navy/60">Atualizando...</span>}
        </div>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center rounded-[4px] border border-black/5 text-sm text-navy/60">
            Carregando usuários...
          </div>
        ) : errorMessage ? (
          <div
            role="alert"
            className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-[4px] border border-red-200 bg-red-50 text-sm text-red-700"
          >
            <p>{errorMessage}</p>
            <button type="button" onClick={reload} className="font-semibold underline">
              Tentar novamente
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center rounded-[4px] border border-black/5 text-sm text-navy/60">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <>
            <UsersTable users={users} />
            <footer className="flex items-center justify-between text-sm text-navy/60">
              <span>
                {firstResult}-{lastResult} de {totalElements} usuários
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  className="h-9 rounded-[4px] border border-black/10 px-3 text-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span>
                  Página {page + 1} de {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages || isFetching}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="h-9 rounded-[4px] border border-black/10 px-3 text-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
