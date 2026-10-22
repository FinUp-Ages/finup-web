import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { createQuestion } from '../api/createQuestion';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { updateQuestion } from '../api/updateQuestion';
import { questionQueryKeys } from '../hooks/questionQueryKeys';
import type { FillBlankQuestionPayload, QuestionDTO, QuestionStatus } from '../types';
import { FillBlankQuestionPage } from './FillBlankQuestionPage';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));
vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));

const draftContent: FillBlankQuestionPayload = {
  type: 'FILL_BLANK',
  title: 'Rendimento do CDB',
  statement: 'O CDB rende ___ do CDI',
  answers: ['100%'],
  explanation: 'Explicação',
};

function questionDTO(status: QuestionStatus = 'DRAFT', draft = draftContent): QuestionDTO {
  const isPublished = status !== 'DRAFT';
  return {
    id: 'q-1',
    status,
    draft,
    published: isPublished ? draftContent : null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: isPublished ? '2026-10-18T12:00:00Z' : null,
  };
}

/** Mostra o caminho atual e simula o Voltar do navegador. */
function LocationProbe() {
  const navigate = useNavigate();
  return (
    <>
      <p data-testid="location">{useLocation().pathname}</p>
      <button type="button" onClick={() => navigate(-1)}>
        Voltar do navegador
      </button>
    </>
  );
}

/** `history` sao as entradas anteriores do navegador, antes de `url`. */
function renderAt(url: string, history: string[] = [], cachedClient?: QueryClient) {
  const queryClient =
    cachedClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  const page = (
    <FillBlankQuestionPage
      backTo="/studies"
      editPathFor={(categoryId, questionId) =>
        `/studies/categories/${categoryId}/questions/${questionId}/edit`
      }
    />
  );
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[...history, url]}>
        <Routes>
          <Route path="/studies" element={<p>Tela da trilha</p>} />
          <Route path="/studies/categories/:categoryId/questions/new/fill-blank" element={page} />
          <Route path="/studies/categories/:categoryId/questions/:questionId/edit" element={page} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), queryClient };
}

const createUrl = '/studies/categories/cat-1/questions/new/fill-blank';
const editUrl = '/studies/categories/cat-1/questions/q-1/edit';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Título'), 'Rendimento do CDB');
  await user.type(screen.getByLabelText('Enunciado'), 'O CDB rende ___ do CDI');
  await user.type(screen.getByLabelText('Respostas aceitas'), '100%{Enter}');
  await user.type(screen.getByLabelText(/Explicação/), 'Explicação');
}

beforeEach(() => {
  vi.mocked(createQuestion).mockReset();
  vi.mocked(updateQuestion).mockReset();
  vi.mocked(getCategoryQuestions).mockReset();
});

describe('FillBlankQuestionPage - criacao', () => {
  it('nao mostra erro nem preenche o formulario com a lista da categoria ja em cache', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(questionQueryKeys.categoryQuestions('cat-1'), [questionDTO()]);

    renderAt(createUrl, [], queryClient);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Enunciado')).toHaveValue('');
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('nao herda um erro da consulta da categoria ao abrir a criacao', async () => {
    const queryClient = new QueryClient();
    const error = new ApiError(500, null);
    await expect(
      queryClient.fetchQuery({
        queryKey: questionQueryKeys.categoryQuestions('cat-1'),
        queryFn: () => Promise.reject(error),
        retry: false,
      }),
    ).rejects.toBe(error);

    renderAt(createUrl, [], queryClient);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('exibe os campos com rotulos e nao carrega perguntas', () => {
    renderAt(createUrl);

    expect(screen.getByRole('heading', { name: 'Nova pergunta: Preencher lacuna' })).toBeVisible();
    expect(screen.getByLabelText('Título')).toBeVisible();
    expect(screen.getByLabelText('Enunciado')).toBeVisible();
    expect(screen.getByLabelText('Respostas aceitas')).toBeVisible();
    expect(screen.getByLabelText(/Explicação/)).toBeVisible();
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('valida no envio, liga os erros aos campos e foca o primeiro invalido', async () => {
    const { user } = renderAt(createUrl);

    await user.type(screen.getByLabelText('Enunciado'), 'Sem lacuna');
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    const title = screen.getByLabelText('Título');
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription('Informe o título.');
    expect(screen.getByLabelText('Enunciado')).toHaveAccessibleDescription(
      /Marque a lacuna no enunciado com ___/,
    );
    expect(screen.getByLabelText('Respostas aceitas')).toHaveAccessibleDescription(
      /Adicione pelo menos uma resposta aceita\./,
    );
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('foca as respostas quando so elas estao invalidas', async () => {
    const { user } = renderAt(createUrl);

    await user.type(screen.getByLabelText('Título'), 'Título');
    await user.type(screen.getByLabelText('Enunciado'), 'A ___');
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(screen.getByLabelText('Respostas aceitas')).toHaveFocus();
  });

  it('adiciona respostas por Enter e pelo botao, recusa vazia e repetida e remove', async () => {
    const { user } = renderAt(createUrl);
    const answerInput = screen.getByLabelText('Respostas aceitas');

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Digite a resposta antes de adicionar.')).toBeVisible();

    await user.type(answerInput, '100%{Enter}');
    await user.type(answerInput, 'cem por cento');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await user.type(answerInput, ' CEM POR CENTO {Enter}');
    expect(screen.getByText('Essa resposta já foi adicionada.')).toBeVisible();

    const list = screen.getByRole('list', { name: 'Respostas aceitas adicionadas' });
    expect(list).toHaveTextContent('100%');
    expect(list).toHaveTextContent('cem por cento');

    await user.click(screen.getByRole('button', { name: 'Remover resposta "100%"' }));
    expect(list).not.toHaveTextContent('100%');
    expect(answerInput).toHaveFocus();
  });

  it('nao deixa remover a ultima resposta aceita', async () => {
    const { user } = renderAt(createUrl);

    await user.type(screen.getByLabelText('Respostas aceitas'), '100%{Enter}');

    expect(screen.getByRole('button', { name: 'Remover resposta "100%"' })).toBeDisabled();
  });

  it('envia o corpo FILL_BLANK no POST, mostra o salvamento e segue para a edicao', async () => {
    let resolveCreate: (dto: QuestionDTO) => void = () => undefined;
    vi.mocked(createQuestion).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    const { user } = renderAt(createUrl);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(createQuestion).toHaveBeenCalledTimes(1);
    expect(createQuestion).toHaveBeenCalledWith('cat-1', draftContent);
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();

    resolveCreate(questionDTO());

    expect(await screen.findByText('Pergunta criada como rascunho.')).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent(editUrl);
    expect(
      screen.getByRole('heading', { name: 'Editar pergunta: Preencher lacuna' }),
    ).toBeVisible();
    expect(await screen.findByDisplayValue('Rendimento do CDB')).toBeVisible();
    // Sem lista em cache, a edicao busca a lista completa da categoria.
    expect(getCategoryQuestions).toHaveBeenCalledWith('cat-1');
  });

  it('depois de criar, o Voltar do navegador nao reabre a criacao', async () => {
    vi.mocked(createQuestion).mockResolvedValue(questionDTO());
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    const { user } = renderAt(createUrl, ['/studies']);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    await screen.findByText('Pergunta criada como rascunho.');

    await user.click(screen.getByRole('button', { name: 'Voltar do navegador' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/studies');
    expect(screen.getByText('Tela da trilha')).toBeVisible();
    expect(screen.queryByText('Pergunta criada como rascunho.')).not.toBeInTheDocument();
  });

  it('mostra o detail do problem+json e preserva os dados quando o POST falha', async () => {
    vi.mocked(createQuestion).mockRejectedValue(
      new ApiError(400, { status: 400, detail: 'O enunciado precisa de uma lacuna.' }),
    );
    const { user } = renderAt(createUrl);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O enunciado precisa de uma lacuna.',
    );
    expect(screen.getByLabelText('Título')).toHaveValue('Rendimento do CDB');
    expect(screen.getByRole('button', { name: 'Criar rascunho' })).toBeEnabled();
  });

  it('mostra mensagem de conexao quando a requisicao nem chega ao servidor', async () => {
    vi.mocked(createQuestion).mockRejectedValue(new ApiError(null, null));
    const { user } = renderAt(createUrl);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao servidor.',
    );
  });
});

describe('FillBlankQuestionPage - edicao', () => {
  it('carrega o rascunho pela lista da categoria e envia o PUT com o corpo FILL_BLANK', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    vi.mocked(updateQuestion).mockResolvedValue(
      questionDTO('DRAFT', { ...draftContent, title: 'Novo título' }),
    );
    const { user } = renderAt(editUrl);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando pergunta...');
    const title = await screen.findByLabelText('Título');
    expect(title).toHaveValue('Rendimento do CDB');
    expect(screen.getByText('Rascunho')).toBeVisible();
    expect(getCategoryQuestions).toHaveBeenCalledWith('cat-1');

    await user.clear(title);
    await user.type(title, 'Novo título');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(updateQuestion).toHaveBeenCalledWith('q-1', { ...draftContent, title: 'Novo título' });
    expect(await screen.findByText('Rascunho salvo.')).toBeVisible();
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('edita o rascunho de pergunta publicada, avisando que a versao no ar nao muda', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO('PUBLISHED')]);
    vi.mocked(updateQuestion).mockResolvedValue(
      questionDTO('PUBLISHED_WITH_CHANGES', { ...draftContent, explanation: 'Nova explicação' }),
    );
    const { user } = renderAt(editUrl);

    expect(await screen.findByText(/Esta pergunta está publicada\./)).toBeVisible();
    expect(screen.getByText('Publicada')).toBeVisible();
    const explanation = screen.getByLabelText(/Explicação/);
    expect(explanation).toBeEnabled();

    await user.clear(explanation);
    await user.type(explanation, 'Nova explicação');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(updateQuestion).toHaveBeenCalledWith('q-1', {
      ...draftContent,
      explanation: 'Nova explicação',
    });
    expect(
      await screen.findByText(
        'Rascunho salvo. A versão publicada só muda quando for publicada de novo.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Publicada com alterações')).toBeVisible();
  });

  it('mostra o detail do problem+json quando o PUT falha', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    vi.mocked(updateQuestion).mockRejectedValue(
      new ApiError(400, { status: 400, detail: 'Adicione pelo menos uma resposta aceita.' }),
    );
    const { user } = renderAt(editUrl);

    await screen.findByDisplayValue('Rendimento do CDB');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Adicione pelo menos uma resposta aceita.',
    );
  });

  it('avisa quando a pergunta nao esta na lista da categoria', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([]);
    renderAt(editUrl);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pergunta não encontrada nesta categoria.',
    );
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });

  it('mostra erro de carregamento com opcao de tentar novamente', async () => {
    vi.mocked(getCategoryQuestions)
      .mockRejectedValueOnce(new ApiError(404, { status: 404 }))
      .mockResolvedValueOnce([questionDTO()]);
    const { user } = renderAt(editUrl);

    expect(await screen.findByRole('alert')).toHaveTextContent('Categoria não encontrada.');
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByDisplayValue('Rendimento do CDB')).toBeVisible();
  });

  it('mantem o formulario sem alerta quando um recarregamento falha', async () => {
    vi.mocked(getCategoryQuestions)
      .mockResolvedValueOnce([questionDTO()])
      .mockRejectedValueOnce(new ApiError(null, null));
    const { queryClient } = renderAt(editUrl);
    await screen.findByDisplayValue('Rendimento do CDB');

    await act(() => queryClient.refetchQueries());

    expect(getCategoryQuestions).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Rendimento do CDB')).toBeVisible();
  });

  it('marca na lista as respostas repetidas vindas do servidor e foca a primeira', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([
      questionDTO('DRAFT', { ...draftContent, answers: ['CDI', 'cdi'] }),
    ]);
    const { user } = renderAt(editUrl);
    await screen.findByDisplayValue('Rendimento do CDB');

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    const removeRepeated = screen.getByRole('button', { name: 'Remover resposta repetida "cdi"' });
    expect(removeRepeated).toHaveFocus();
    expect(
      screen.getByRole('list', { name: 'Respostas aceitas adicionadas' }),
    ).toHaveAccessibleDescription('Remova as respostas aceitas repetidas.');
    expect(screen.getByLabelText('Respostas aceitas')).not.toHaveAttribute('aria-invalid');
    expect(updateQuestion).not.toHaveBeenCalled();
  });

  it('nao abre o formulario para pergunta de outro tipo', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([
      { ...questionDTO(), draft: { type: 'MULTIPLE_CHOICE' } },
    ]);
    renderAt(editUrl);

    expect(await screen.findByRole('alert')).toHaveTextContent('Múltipla escolha');
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });
});
