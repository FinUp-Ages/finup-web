import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { DASHBOARD_WIDGETS_STORAGE_KEY } from '../api/dashboardWidgetsService';

vi.mock('../components/WidgetsIndicadores', () => ({
  WidgetReceita: () => <h2>Receita bruta</h2>,
  WidgetUsuariosAtivos: () => <h2>Usuários ativos</h2>,
  WidgetClientesNovos: () => <h2>Clientes novos</h2>,
  WidgetCustoOperacional: () => <h2>Custo operacional</h2>,
}));
vi.mock('../components/WidgetCrescimentoUsuario', () => ({
  WidgetCrescimentoUsuario: () => <h2>Crescimento do usuário</h2>,
}));

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function mount(client = createClient()) {
  return render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
});

describe('Configuracao de widgets no dashboard', () => {
  it('desativa e reordena, salva e preserva configuracao apos remontar com novo cache', async () => {
    const user = userEvent.setup();
    const page = mount();
    await screen.findByRole('heading', { name: 'Clientes novos' });
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Receita bruta' }));
    await user.click(
      within(dialog).getByRole('button', { name: 'Mover Clientes novos para cima' }),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('status');
    expect(screen.queryByRole('heading', { name: 'Receita bruta' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading').map((node) => node.textContent)).toEqual([
      'Clientes novos',
      'Usuários ativos',
      'Custo operacional',
      'Crescimento do usuário',
    ]);
    page.unmount();
    mount();
    await screen.findByRole('heading', { name: 'Clientes novos' });
    expect(screen.queryByRole('heading', { name: 'Receita bruta' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Clientes novos');
    expect(
      JSON.parse(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)!).widgets[0].enabled,
    ).toBe(false);
  });

  it('cancelar descarta o rascunho e permite ocultar todos e reativar depois', async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByRole('heading', { name: 'Receita bruta' });
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    await user.click(screen.getByRole('checkbox', { name: 'Receita bruta' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('heading', { name: 'Receita bruta' })).toBeInTheDocument();
    expect(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText(/Nenhum widget ativo/);
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    await user.click(screen.getByRole('checkbox', { name: 'Clientes novos' }));
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('heading', { name: 'Clientes novos' });
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('mantem o rascunho e a tela anterior quando salvar falha, e permite tentar novamente', async () => {
    const user = userEvent.setup();
    mount();
    await screen.findByRole('heading', { name: 'Receita bruta' });
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    await user.click(screen.getByRole('checkbox', { name: 'Receita bruta' }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota');
    });
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar');
    expect(screen.getByRole('checkbox', { name: 'Receita bruta' })).not.toBeChecked();
    expect(screen.getByRole('heading', { name: 'Receita bruta' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'Receita bruta' })).not.toBeInTheDocument();
  });

  it('exibe o padrao quando a leitura falha e recupera sem sobrescrever a configuracao', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('blocked');
    });
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    expect(screen.getAllByRole('heading')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Editar widgets' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Editar widgets' })).toBeEnabled();
    expect(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)).toBeNull();
  });

  it('com configuracao invalida, restaurar padrao grava o padrao e libera a edicao', async () => {
    const user = userEvent.setup();
    localStorage.setItem(DASHBOARD_WIDGETS_STORAGE_KEY, '{invalido');
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('Exibindo os widgets padrão');
    expect(screen.getAllByRole('heading')).toHaveLength(5);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)).toBe('{invalido');
    await user.click(screen.getByRole('button', { name: 'Restaurar padrão' }));
    await screen.findByRole('status');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar widgets' })).toBeEnabled();
    const stored = JSON.parse(localStorage.getItem(DASHBOARD_WIDGETS_STORAGE_KEY)!);
    expect(stored.widgets).toHaveLength(5);
    expect(stored.widgets.every(({ enabled }: { enabled: boolean }) => enabled)).toBe(true);
  });

  it('mantem a configuracao em cache quando um refetch falha', async () => {
    const user = userEvent.setup();
    const client = createClient();
    const page = mount(client);
    await screen.findByRole('heading', { name: 'Receita bruta' });
    await user.click(screen.getByRole('button', { name: 'Editar widgets' }));
    await user.click(screen.getByRole('checkbox', { name: 'Receita bruta' }));
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('status');
    page.unmount();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    mount(client);
    await waitFor(() =>
      expect(client.getQueryState(['dashboard', 'widget-configuration'])?.status).toBe('error'),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Receita bruta' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Editar widgets' })).toBeEnabled();
  });
});
