/**
 * Card de indicador do dashboard (Figma: nó 191-2603, cards 191-2604, 191-2611 e 191-2625).
 *
 * Titulo, valor e a variacao em relacao ao periodo anterior. O fundo da variacao e verde
 * quando a mudanca e favoravel e vermelho quando e desfavoravel: para custo, alta e ruim.
 */
import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { Indicador } from '../types';

type WidgetIndicadorProps = {
  titulo: string;
  filtro?: ReactNode;
  textoComparacao?: string;
  dados: Indicador | null;
  isLoading: boolean;
  errorMessage: string | null;
  onTentarNovamente: () => void;
  /** false quando subir e ruim (ex.: custo). Padrao: true. */
  altaEhFavoravel?: boolean;
};

function toCorVariacao(dados: Indicador, altaEhFavoravel: boolean): string {
  if (dados.tendencia === 'estavel') {
    return 'bg-chart-surface';
  }
  const favoravel = (dados.tendencia === 'alta') === altaEhFavoravel;
  return favoravel ? 'bg-indicator-favorable' : 'bg-indicator-unfavorable';
}

export function WidgetIndicador({
  titulo,
  filtro,
  textoComparacao = 'em relação ao mês anterior.',
  dados,
  isLoading,
  errorMessage,
  onTentarNovamente,
  altaEhFavoravel = true,
}: WidgetIndicadorProps) {
  const IconeVariacao =
    dados?.tendencia === 'alta'
      ? ArrowUpRight
      : dados?.tendencia === 'baixa'
        ? ArrowDownRight
        : Minus;

  return (
    <section className="flex min-h-[164px] w-[271px] flex-col gap-2.5 rounded-lg bg-background p-6 font-inter tracking-[0.02em] text-navy">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-xs font-medium">{titulo}</h2>
          {filtro}
        </div>
        {isLoading ? (
          <p role="status" className="m-0 h-[26px] text-xs font-medium leading-[26px] text-navy/50">
            Carregando...
          </p>
        ) : (
          <p
            className={
              filtro
                ? 'm-0 text-[28px] font-semibold leading-7 tracking-tight text-chart-value tabular-nums'
                : 'm-0 h-[26px] text-xl font-medium text-chart-value'
            }
          >
            {dados?.valor ?? ''}
          </p>
        )}
      </div>

      {errorMessage ? (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="m-0 text-xs font-medium text-error">{errorMessage}</p>
          <button
            type="button"
            onClick={onTentarNovamente}
            className="cursor-pointer rounded-full border-0 bg-navy px-4 py-1.5 text-xs text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
          >
            Tentar novamente
          </button>
        </div>
      ) : filtro ? (
        <div className="flex flex-col items-start gap-1">
          {dados && (
            <>
              <p
                className={`m-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${toCorVariacao(dados, altaEhFavoravel)}`}
              >
                <IconeVariacao size={14} aria-hidden="true" />
                <span>{dados.variacao}</span>
              </p>
              <p className="m-0 text-[11px] leading-4 tracking-normal text-navy/60">
                {textoComparacao}
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          className={`flex min-h-[60px] items-center rounded-lg px-4 py-2.5 ${
            dados ? toCorVariacao(dados, altaEhFavoravel) : 'bg-chart-surface'
          }`}
        >
          {dados && (
            <p className="m-0 text-[15px] leading-5">{`${dados.variacao} ${textoComparacao}`}</p>
          )}
        </div>
      )}
    </section>
  );
}
