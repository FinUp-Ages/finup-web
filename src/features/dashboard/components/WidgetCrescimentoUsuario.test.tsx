import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CrescimentoUsuario } from '../types';
import { GraficoCrescimentoUsuario } from './GraficoCrescimentoUsuario';
import { WidgetCrescimentoUsuario } from './WidgetCrescimentoUsuario';

vi.mock('@/shared/config/env', () => ({ env: { useMocks: true } }));

const opcoesPeriodo = [
  { meses: 3, rotulo: 'Últimos 3 meses' },
  { meses: 6, rotulo: 'Últimos 6 meses' },
];

function renderGrafico(props: Partial<Parameters<typeof GraficoCrescimentoUsuario>[0]> = {}) {
  const handlers = { onTentarNovamente: vi.fn(), onPeriodoChange: vi.fn() };
  render(
    <GraficoCrescimentoUsuario
      dados={null}
      isLoading={false}
      errorMessage={null}
      periodo={6}
      opcoesPeriodo={opcoesPeriodo}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

const umPonto: CrescimentoUsuario = {
  crescimento: '0%',
  pontos: [{ mes: '2026-07', rotulo: 'Jul', totalUsuarios: 3, novosUsuarios: 1 }],
  valorMaximo: 5,
  rotulosEixoY: ['5', '4', '3', '2', '1', '0'],
};

describe('WidgetCrescimentoUsuario', () => {
  it('carrega o mock de 6 meses e troca o periodo', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <WidgetCrescimentoUsuario />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    expect(await screen.findByText('278%')).toBeVisible();
    const lista = screen.getByRole('list');
    expect(within(lista).getAllByRole('listitem')).toHaveLength(6);
    expect(within(lista).getByText('Jul: 378 usuários, 78 novos')).toBeInTheDocument();

    await userEvent.setup().selectOptions(screen.getByLabelText('Período do gráfico'), '3');

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
  });
});

describe('GraficoCrescimentoUsuario', () => {
  it('mostra o erro e deixa tentar de novo', async () => {
    const { onTentarNovamente, user } = renderGrafico({ errorMessage: 'Falhou.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
  });

  it('avisa quando o periodo nao tem dados', () => {
    renderGrafico({ dados: { ...umPonto, pontos: [] } });
    expect(screen.getByText('Sem dados para o período.')).toBeVisible();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('centraliza um ponto unico e avisa a troca de periodo', async () => {
    const { onPeriodoChange, user } = renderGrafico({ dados: umPonto });
    expect(screen.getByText('Jul: 3 usuários, 1 novos')).toBeInTheDocument();
    expect(screen.getByText('Jul', { selector: 'span' })).toHaveStyle({ left: '50%' });

    await user.selectOptions(screen.getByLabelText('Período do gráfico'), '3');
    expect(onPeriodoChange).toHaveBeenCalledWith(3);
  });
});
