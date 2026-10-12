/**
 * Card "Crescimento do usuário" (Figma: nó 191-2583 / card 191-2560).
 *
 * Linha mensal do total de usuários. A linha e desenhada a partir dos dados, nao de uma imagem fixa.
 * Pontos e rotulos usam a mesma escala em %: x de 0 (primeiro mes) a 100 (ultimo),
 * y de 0 (valorMaximo, topo) a 100 (zero, base).
 */
import { ChevronDown } from 'lucide-react';
import pontoHalo from '@/shared/assets/dashboard/ponto-halo.svg';
import ponto from '@/shared/assets/dashboard/ponto.svg';
import type { CrescimentoUsuario } from '../types';

export type OpcaoPeriodo = {
  meses: number;
  rotulo: string;
};

type GraficoCrescimentoUsuarioProps = {
  dados: CrescimentoUsuario | null;
  isLoading: boolean;
  errorMessage: string | null;
  onTentarNovamente: () => void;
  periodo: number;
  opcoesPeriodo: OpcaoPeriodo[];
  onPeriodoChange: (meses: number) => void;
};

function toPosicaoX(indice: number, total: number): number {
  return total === 1 ? 50 : (indice / (total - 1)) * 100;
}

export function GraficoCrescimentoUsuario({
  dados,
  isLoading,
  errorMessage,
  onTentarNovamente,
  periodo,
  opcoesPeriodo,
  onPeriodoChange,
}: GraficoCrescimentoUsuarioProps) {
  const temPontos = dados !== null && dados.pontos.length > 0;
  const coordenadas = temPontos
    ? dados.pontos.map((pontoGrafico, indice) => ({
        x: toPosicaoX(indice, dados.pontos.length),
        y: (1 - Math.min(pontoGrafico.totalUsuarios / dados.valorMaximo, 1)) * 100,
      }))
    : [];
  const maiorRotuloY = temPontos
    ? dados.rotulosEixoY.reduce((maior, rotulo) => (rotulo.length > maior.length ? rotulo : maior))
    : '';

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg bg-white p-6 font-inter tracking-[0.02em] text-navy">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-xs font-medium">Crescimento do usuário</h2>
          <p className="m-0 h-6 text-xl font-medium text-dashboard-valor">
            {dados?.crescimento ?? ''}
          </p>
        </div>

        <label className="relative flex items-center">
          <span className="sr-only">Período do gráfico</span>
          <select
            value={periodo}
            onChange={(evento) => onPeriodoChange(Number(evento.target.value))}
            className="cursor-pointer appearance-none border-0 bg-transparent pr-6 text-xs font-medium text-navy focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
          >
            {opcoesPeriodo.map((opcao) => (
              <option key={opcao.meses} value={opcao.meses}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute right-0 text-black"
          />
        </label>
      </header>

      <div className="grid grid-cols-[auto_1fr] gap-2.5">
        <div aria-hidden="true" className="h-[239px] py-2.5 text-[10px] font-medium text-navy/50">
          <div className="relative h-full">
            {/* Rotulo invisivel que da a largura da coluna; os visiveis sao absolutos. */}
            <span className="invisible block">{maiorRotuloY}</span>
            {temPontos &&
              dados.rotulosEixoY.map((rotulo, indice) => (
                <span
                  key={rotulo}
                  className="absolute left-0 -translate-y-1/2"
                  style={{ top: `${(indice / (dados.rotulosEixoY.length - 1)) * 100}%` }}
                >
                  {rotulo}
                </span>
              ))}
          </div>
        </div>

        <div className="flex h-[239px] items-center justify-center rounded-lg bg-dashboard-grafico px-4 py-2.5">
          {isLoading ? (
            <p role="status" className="m-0 text-xs font-medium text-navy/50">
              Carregando...
            </p>
          ) : errorMessage ? (
            <div role="alert" className="flex flex-col items-center gap-2">
              <p className="m-0 text-xs font-medium text-login-error">{errorMessage}</p>
              <button
                type="button"
                onClick={onTentarNovamente}
                className="cursor-pointer rounded-full border-0 bg-navy px-4 py-1.5 text-xs text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          ) : !temPontos ? (
            <p className="m-0 text-xs font-medium text-navy/50">Sem dados para o período.</p>
          ) : (
            <div aria-hidden="true" className="relative h-full w-full">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <polyline
                  points={coordenadas.map(({ x, y }) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke="#7086FD"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {coordenadas.map(({ x, y }, indice) => (
                <span key={indice} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <img
                    src={pontoHalo}
                    alt=""
                    width={16}
                    height={16}
                    className="absolute left-[-8px] top-[-8px] block max-w-none"
                  />
                  <img
                    src={ponto}
                    alt=""
                    width={8}
                    height={8}
                    className="absolute left-[-4px] top-[-4px] block max-w-none"
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {temPontos && (
          <div aria-hidden="true" className="col-start-2 px-4 text-xs font-medium">
            <div className="relative h-[15px]">
              {dados.pontos.map((pontoGrafico, indice) => (
                <span
                  key={pontoGrafico.rotulo}
                  className="absolute top-0 -translate-x-1/2 leading-[15px]"
                  style={{ left: `${toPosicaoX(indice, dados.pontos.length)}%` }}
                >
                  {pontoGrafico.rotulo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {temPontos && (
        <ul className="sr-only">
          {dados.pontos.map((pontoGrafico) => (
            <li key={pontoGrafico.rotulo}>
              {`${pontoGrafico.rotulo}: ${pontoGrafico.totalUsuarios} usuários, ${pontoGrafico.novosUsuarios} novos`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
