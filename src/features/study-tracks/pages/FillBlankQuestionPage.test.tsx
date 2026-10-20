import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { createQuestion } from '../api/createQuestion';
import { getQuestion } from '../api/getQuestion';
import { updateQuestion } from '../api/updateQuestion';
import type { QuestionDTO } from '../types';
import { FillBlankQuestionPage } from './FillBlankQuestionPage';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));
vi.mock('../api/getQuestion', () => ({ getQuestion: vi.fn() }));

const draftQuestion: QuestionDTO = {
  id: 'q-1',
  categoryId: 'cat-1',
  type: 'FILL_BLANK',
  status: 'DRAFT',
  title: 'Rendimento do CDB',
  statement: 'O CDB rende ___ do CDI',
  answers: ['100%'],
  explanation: 'Explicação',
};

/** Mostra o caminho atual, para conferir a navegacao depois de criar. */
function LocationProbe() {
  return <p data-testid="location">{useLocation().pathname}</p>;
}

function renderAt(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const page = (
    <FillBlankQuestionPage
      backTo="/studies"
      editPathFor={(questionId) => `/studies/questions/${questionId}/edit`}
    />
  );
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/studies" element={<p>Tela da trilha</p>} />
          <Route path="/studies/categories/:categoryId/questions/new/fill-blank" element={page} />
          <Route path="/studies/questions/:questionId/edit" element={page} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup() };
}

const createUrl = '/studies/categories/cat-1/questions/new/fill-blank';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Título'), 'Rendimento do CDB');
  await user.type(screen.getByLabelText('Enunciado'), 'O CDB rende ___ do CDI');
  await user.type(screen.getByLabelText('Respostas aceitas'), '100%{Enter}');
  await user.type(screen.getByLabelText(/Explicação/), 'Explicação');
}

beforeEach(() => {
  vi.mocked(createQuestion).mockReset();
  vi.mocked(updateQuestion).mockReset();
  vi.mocked(getQuestion).mockReset();
});

describe('FillBlankQuestionPage - criacao', () => {
  it('exibe os campos com rotulos e nao carrega pergunta', () => {
    renderAt(createUrl);

    expect(screen.getByRole('heading', { name: 'Nova pergunta: Preencher lacuna' })).toBeVisible();
    expect(screen.getByLabelText('Título')).toBeVisible();
    expect(screen.getByLabelText('Enunciado')).toBeVisible();
    expect(screen.getByLabelText('Respostas aceitas')).toBeVisible();
    expect(screen.getByLabelText(/Explicação/)).toBeVisible();
    expect(getQuestion).not.toHaveBeenCalled();
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
    vi.mocked(getQuestion).mockResolvedValue(draftQuestion);
    const { user } = renderAt(createUrl);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(createQuestion).toHaveBeenCalledTimes(1);
    expect(createQuestion).toHaveBeenCalledWith('cat-1', {
      type: 'FILL_BLANK',
      title: 'Rendimento do CDB',
      statement: 'O CDB rende ___ do CDI',
      answers: ['100%'],
      explanation: 'Explicação',
    });
    const savingButton = screen.getByRole('button', { name: 'Salvando...' });
    expect(savingButton).toBeDisabled();

    resolveCreate(draftQuestion);

    expect(await screen.findByText('Pergunta criada como rascunho.')).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/studies/questions/q-1/edit');
    expect(
      screen.getByRole('heading', { name: 'Editar pergunta: Preencher lacuna' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Título')).toHaveValue('Rendimento do CDB');
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
  it('carrega o rascunho e envia o PUT com o corpo FILL_BLANK', async () => {
    vi.mocked(getQuestion).mockResolvedValue(draftQuestion);
    vi.mocked(updateQuestion).mockResolvedValue({ ...draftQuestion, title: 'Novo título' });
    const { user } = renderAt('/studies/questions/q-1/edit');

    expect(screen.getByRole('status')).toHaveTextContent('Carregando pergunta...');
    const title = await screen.findByLabelText('Título');
    expect(title).toHaveValue('Rendimento do CDB');
    expect(screen.getByText('Rascunho')).toBeVisible();
    expect(getQuestion).toHaveBeenCalledWith('q-1');

    await user.clear(title);
    await user.type(title, 'Novo título');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(updateQuestion).toHaveBeenCalledWith('q-1', {
      type: 'FILL_BLANK',
      title: 'Novo título',
      statement: 'O CDB rende ___ do CDI',
      answers: ['100%'],
      explanation: 'Explicação',
    });
    expect(await screen.findByText('Rascunho salvo.')).toBeVisible();
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('abre pergunta publicada somente leitura, sem botao de salvar', async () => {
    vi.mocked(getQuestion).mockResolvedValue({ ...draftQuestion, status: 'PUBLISHED' });
    renderAt('/studies/questions/q-1/edit');

    expect(
      await screen.findByText(/Somente perguntas em rascunho podem ser editadas\./),
    ).toBeVisible();
    expect(screen.getByLabelText('Título')).toBeDisabled();
    expect(screen.getByLabelText('Enunciado')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Salvar rascunho' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover resposta/ })).not.toBeInTheDocument();
  });

  it('trata a recusa 409 do PUT quando a pergunta deixou de ser rascunho', async () => {
    vi.mocked(getQuestion).mockResolvedValue(draftQuestion);
    vi.mocked(updateQuestion).mockRejectedValue(
      new ApiError(409, {
        status: 409,
        detail: 'Somente perguntas em rascunho podem ser editadas.',
      }),
    );
    const { user } = renderAt('/studies/questions/q-1/edit');

    await screen.findByDisplayValue('Rendimento do CDB');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Somente perguntas em rascunho podem ser editadas.',
    );
  });

  it('mostra erro de carregamento com opcao de tentar novamente', async () => {
    vi.mocked(getQuestion)
      .mockRejectedValueOnce(new ApiError(404, { status: 404 }))
      .mockResolvedValueOnce(draftQuestion);
    const { user } = renderAt('/studies/questions/q-1/edit');

    expect(await screen.findByRole('alert')).toHaveTextContent('Pergunta não encontrada.');
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByDisplayValue('Rendimento do CDB')).toBeVisible();
  });

  it('nao abre o formulario para pergunta de outro tipo', async () => {
    vi.mocked(getQuestion).mockResolvedValue({
      id: 'q-2',
      categoryId: 'cat-1',
      type: 'MULTIPLE_CHOICE',
      status: 'DRAFT',
    });
    renderAt('/studies/questions/q-2/edit');

    expect(await screen.findByRole('alert')).toHaveTextContent('Múltipla escolha');
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });
});
