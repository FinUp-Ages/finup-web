/**
 * Hook de dados do card "Crescimento do usuário".
 *
 * Envolve a chamada de API no TanStack Query, mantem loading/erro/dado
 * e entrega o dado ja no formato que a tela exibe. Nunca importa nem retorna JSX.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUserGrowth } from '../api/getUserGrowth';
import type { CrescimentoUsuario, UserGrowthDTO } from '../types';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Quantidade de intervalos do eixo Y (gera 6 rotulos, como no Figma). */
const DIVISOES_EIXO_Y = 5;

const formatoNumero = new Intl.NumberFormat('pt-BR');
const formatoPercentual = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** "2026-05" -> "Mai". */
function toRotuloMes(month: string): string {
  const mes = Number(month.split('-')[1]);
  return MESES[mes - 1] ?? month;
}

/** Arredonda o passo do eixo para 1, 2 ou 5 vezes uma potencia de 10. */
function toPassoRedondo(valor: number): number {
  if (valor <= 0) {
    return 1;
  }
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const fator = valor / potencia;
  const fatorRedondo = fator <= 1 ? 1 : fator <= 2 ? 2 : fator <= 5 ? 5 : 10;
  return Math.max(fatorRedondo * potencia, 1);
}

function toCrescimentoUsuario(dto: UserGrowthDTO): CrescimentoUsuario {
  const maiorTotal = Math.max(0, ...dto.points.map((ponto) => ponto.totalUsers));
  const passo = toPassoRedondo(Math.ceil(maiorTotal / DIVISOES_EIXO_Y));
  const valorMaximo = passo * DIVISOES_EIXO_Y;

  return {
    crescimento: `${formatoPercentual.format(dto.growthPct)}%`,
    pontos: dto.points.map((ponto) => ({
      mes: ponto.month,
      rotulo: toRotuloMes(ponto.month),
      totalUsuarios: ponto.totalUsers,
      novosUsuarios: ponto.newUsers,
    })),
    valorMaximo,
    rotulosEixoY: Array.from({ length: DIVISOES_EIXO_Y + 1 }, (_, indice) =>
      formatoNumero.format(valorMaximo - indice * passo),
    ),
  };
}

export function useUserGrowth(months: number) {
  const query = useQuery({
    queryKey: ['dashboard', 'user-growth', months],
    queryFn: () => getUserGrowth(months),
    select: toCrescimentoUsuario,
    // Ao trocar o periodo, mantem o grafico anterior ate o novo chegar (sem piscar "Carregando...").
    placeholderData: keepPreviousData,
  });

  return {
    dados: query.data ?? null,
    isLoading: query.isPending,
    // TODO: implementar em tarefa futura — usar a mensagem normalizada pelo httpClient.
    errorMessage: query.isError ? 'Não foi possível carregar o crescimento dos usuários.' : null,
    reload: () => {
      void query.refetch();
    },
  };
}
