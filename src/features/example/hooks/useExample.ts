/**
 * Hook de dados da feature "example".
 *
 * Envolve a chamada de API no TanStack Query, mantem loading/erro/dado
 * e entrega o dado ja no formato que a tela exibe. Nunca importa nem retorna JSX.
 */
import { useQuery } from '@tanstack/react-query';
import { getExample } from '../api/getExample';
import type { ExampleDTO, ExampleItem } from '../types';

function toExampleItem(dto: ExampleDTO): ExampleItem {
  // TODO: implementar em tarefa futura — transformacoes reais de exibicao (datas, moeda, rotulos).
  return { id: dto.id, title: dto.name };
}

export function useExample() {
  const query = useQuery({
    queryKey: ['example'],
    queryFn: getExample,
    select: (data) => data.map(toExampleItem),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isPending,
    // TODO: implementar em tarefa futura — usar a mensagem normalizada pelo httpClient.
    errorMessage: query.isError ? 'Não foi possível carregar os dados.' : null,
    reload: () => {
      void query.refetch();
    },
  };
}
