import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { paths, studiesCategoryQuestionsPath, studiesEditQuestionPath } from './paths';
import { studyTracksRoutes } from './studyTracksRoutes';

// Teste das rotas reais com a API simulada da feature, sem sessao nem chamadas externas.
// A protecao de acesso continua no router principal, fora desta arvore isolada de teste.
vi.mock('@/shared/config/env', () => ({
  env: { useMocks: true, apiBaseUrl: 'http://localhost:8080' },
}));

function RoutesUnderTest() {
  const route = useRoutes(studyTracksRoutes);
  const location = useLocation();
  return (
    <>
      {route}
      <p data-testid="path">{location.pathname}</p>
    </>
  );
}

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <RoutesUnderTest />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

describe('contrato de integracao das rotas da Trilha', () => {
  it('conecta categorias, lista e retorno usando as rotas reais', async () => {
    const user = renderAt(paths.studies);
    await user.click(
      await screen.findByRole('link', { name: 'Gerenciar perguntas de Reserva de emergência' }),
    );
    expect(await screen.findByRole('table', { name: 'Perguntas da categoria' })).toBeVisible();
    expect(screen.getByTestId('path')).toHaveTextContent(
      studiesCategoryQuestionsPath('categoria-reserva'),
    );

    await user.click(screen.getByRole('link', { name: /Categorias da trilha/ }));

    expect(
      await screen.findByRole('table', { name: 'Categorias da trilha de estudos' }),
    ).toBeVisible();
  });

  it.each([
    ['FILL_BLANK', 'fill-blank', 'Preencher lacuna'],
    ['MULTIPLE_CHOICE', 'multiple-choice', 'Múltipla escolha'],
    ['LEARNING', 'learning', 'Conteúdo educativo'],
  ])('preserva categoria e destino de criacao %s para a integracao', async (type, slug, label) => {
    const user = renderAt(studiesCategoryQuestionsPath('categoria-reserva'));
    await screen.findByRole('table');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de pergunta' }), type);

    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }));

    expect(screen.getByTestId('path')).toHaveTextContent(
      `/app/studies/categories/categoria-reserva/questions/new/${slug}`,
    );
    expect(screen.getByRole('heading', { name: `Nova pergunta: ${label}` })).toBeVisible();
    if (type === 'FILL_BLANK') {
      expect(screen.getByLabelText('Título')).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('status')).toHaveTextContent(
        'O formulário deste tipo ainda não está disponível.',
      );
    }
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(screen.getByTestId('path')).toHaveTextContent(
      studiesCategoryQuestionsPath('categoria-reserva'),
    );
  });

  it.each([
    ['Rendimento do CDB', 'pergunta-rascunho', 'Preencher lacuna'],
    ['Onde guardar a reserva de emergência?', 'pergunta-multipla-escolha', 'Múltipla escolha'],
    ['Por que ter uma reserva de emergência?', 'conteudo-educativo', 'Conteúdo educativo'],
  ])('preserva o id e o tipo ao abrir a edicao de %s', async (title, id, label) => {
    const user = renderAt(studiesCategoryQuestionsPath('categoria-reserva'));
    await user.click(await screen.findByRole('link', { name: `Editar pergunta ${title}` }));

    expect(screen.getByTestId('path')).toHaveTextContent(
      studiesEditQuestionPath('categoria-reserva', id),
    );
    expect(await screen.findByRole('heading', { name: `Editar pergunta: ${label}` })).toBeVisible();
    if (id === 'pergunta-rascunho') {
      expect(screen.getByLabelText('Título')).toBeVisible();
    } else {
      expect(screen.getByRole('alert')).toHaveTextContent('ainda não pode ser editado no painel');
      expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
    }
    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));
    expect(screen.getByTestId('path')).toHaveTextContent(
      studiesCategoryQuestionsPath('categoria-reserva'),
    );
  });

  it('mantem ids codificados e o retorno correto no acesso direto a edicao', async () => {
    const categoryId = 'categoria / teste';
    const user = renderAt(studiesEditQuestionPath(categoryId, 'pergunta / teste'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pergunta não encontrada nesta categoria.',
    );

    await user.click(screen.getByRole('link', { name: /Perguntas da categoria/ }));

    expect(screen.getByTestId('path')).toHaveTextContent(studiesCategoryQuestionsPath(categoryId));
    expect(await screen.findByText('Nenhuma pergunta cadastrada nesta categoria.')).toBeVisible();
  });
});
