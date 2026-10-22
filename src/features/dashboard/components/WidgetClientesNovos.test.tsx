import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WidgetClientesNovos } from './WidgetsIndicadores';
import { getMetricsSummary } from '../api/getMetricsSummary';
import { getMetricsSummaryMock } from '../api/metricsSummaryMock';
import type { MetricsSummaryDTO } from '../types';

vi.mock('../api/getMetricsSummary', () => ({ getMetricsSummary: vi.fn() }));
const getSummary = vi.mocked(getMetricsSummary);

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WidgetClientesNovos />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getSummary.mockReset();
  getSummary.mockImplementation(async (period) => getMetricsSummaryMock(period));
});

describe('Clientes novos com filtro', () => {
  it('consulta os tres periodos e apresenta newUsers, sinal e cor correspondentes', async () => {
    const user = userEvent.setup();
    mount();
    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(getSummary).toHaveBeenCalledWith('30d');
    expect(screen.getByText('-4%').parentElement).toHaveClass('bg-indicator-unfavorable');
    const filter = screen.getByRole('combobox', { name: 'Período de clientes novos' });
    await user.selectOptions(filter, '7d');
    expect(await screen.findByText('4')).toBeInTheDocument();
    expect(getSummary).toHaveBeenLastCalledWith('7d');
    expect(screen.getByText('0%').parentElement).toHaveClass('bg-chart-surface');
    await user.selectOptions(filter, '90d');
    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(getSummary).toHaveBeenLastCalledWith('90d');
    expect(screen.getByText('+20%').parentElement).toHaveClass('bg-indicator-favorable');
  });

  it('mostra loading na troca e ignora resposta atrasada de outro periodo', async () => {
    let resolve30!: (data: MetricsSummaryDTO) => void;
    getSummary.mockImplementation((period) =>
      period === '30d'
        ? new Promise((resolve) => {
            resolve30 = resolve;
          })
        : Promise.resolve(getMetricsSummaryMock(period)),
    );
    mount();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    await userEvent.selectOptions(screen.getByRole('combobox'), '90d');
    expect(await screen.findByText('42')).toBeInTheDocument();
    resolve30(getMetricsSummaryMock('30d'));
    await waitFor(() => expect(screen.queryByText('12')).not.toBeInTheDocument());
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('permite tentar novamente no periodo selecionado e apresenta valor zero', async () => {
    mount();
    await screen.findByText('12');
    getSummary.mockRejectedValueOnce(new Error('offline'));
    await userEvent.selectOptions(screen.getByRole('combobox'), '7d');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os clientes novos.',
    );
    getSummary.mockResolvedValueOnce({
      ...getMetricsSummaryMock('7d'),
      newUsers: { value: 0, previousValue: 4, changePct: -100 },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('0')).toBeInTheDocument();
    expect(getSummary).toHaveBeenLastCalledWith('7d');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
