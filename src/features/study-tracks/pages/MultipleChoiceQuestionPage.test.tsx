import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import { createQuestion } from '../api/createQuestion';
import { discardDraftQuestion } from '../api/discardDraftQuestion';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { publishQuestion } from '../api/publishQuestion';
import { unpublishQuestion } from '../api/unpublishQuestion';
import { updateQuestion } from '../api/updateQuestion';
import type { MultipleChoiceQuestionPayload, QuestionDTO, QuestionStatus } from '../types';
import { MultipleChoiceQuestionPage } from './MultipleChoiceQuestionPage';

vi.mock('../api/createQuestion', () => ({ createQuestion: vi.fn() }));
vi.mock('../api/updateQuestion', () => ({ updateQuestion: vi.fn() }));
vi.mock('../api/getCategoryQuestions', () => ({ getCategoryQuestions: vi.fn() }));
vi.mock('../api/publishQuestion', () => ({ publishQuestion: vi.fn() }));
vi.mock('../api/unpublishQuestion', () => ({ unpublishQuestion: vi.fn() }));
vi.mock('../api/discardDraftQuestion', () => ({ discardDraftQuestion: vi.fn() }));

const draftContent: MultipleChoiceQuestionPayload = {
  type: 'MULTIPLE_CHOICE',
  statement: 'Onde guardar a reserva de emergência?',
  options: [
    { text: 'Em investimento de alta liquidez e baixo risco', correct: true },
    { text: 'Em investimento sem resgate imediato', correct: false },
  ],
  explanation: 'A reserva precisa estar disponível para imprevistos.',
};

function questionDTO(status: QuestionStatus = 'DRAFT', draft = draftContent): QuestionDTO {
  const isPublished = status !== 'DRAFT';
  return {
    id: 'q-mc-1',
    status,
    draft,
    published: isPublished ? draftContent : null,
    updatedAt: '2026-10-20T12:00:00Z',
    publishedAt: isPublished ? '2026-10-18T12:00:00Z' : null,
  };
}

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

function renderAt(url: string, history: string[] = [], cachedClient?: QueryClient) {
  const queryClient =
    cachedClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  const page = (
    <MultipleChoiceQuestionPage
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
          <Route
            path="/studies/categories/:categoryId/questions/new/multiple-choice"
            element={page}
          />
          <Route path="/studies/categories/:categoryId/questions/:questionId/edit" element={page} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), queryClient };
}

const createUrl = '/studies/categories/cat-1/questions/new/multiple-choice';
const editUrl = '/studies/categories/cat-1/questions/q-mc-1/edit';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Enunciado'), 'Onde guardar a reserva de emergência?');
  await user.type(
    screen.getByLabelText('Alternativa 1'),
    'Em investimento de alta liquidez e baixo risco',
  );
  await user.type(
    screen.getByLabelText('Alternativa 2'),
    'Em investimento sem resgate imediato',
  );
  await user.click(screen.getByRole('radio', { name: 'Marcar alternativa 1 como correta' }));
  await user.type(
    screen.getByLabelText(/Explicação/),
    'A reserva precisa estar disponível para imprevistos.',
  );
}

beforeEach(() => {
  vi.mocked(createQuestion).mockReset();
  vi.mocked(updateQuestion).mockReset();
  vi.mocked(getCategoryQuestions).mockReset();
  vi.mocked(publishQuestion).mockReset();
  vi.mocked(unpublishQuestion).mockReset();
  vi.mocked(discardDraftQuestion).mockReset();
});

describe('MultipleChoiceQuestionPage - criacao', () => {
  it('exibe os campos com rotulos e nao carrega perguntas da categoria', () => {
    renderAt(createUrl);

    expect(
      screen.getByRole('heading', { name: 'Nova pergunta: Múltipla escolha' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Enunciado')).toBeVisible();
    expect(screen.getByLabelText('Alternativa 1')).toBeVisible();
    expect(screen.getByLabelText('Alternativa 2')).toBeVisible();
    expect(screen.getByLabelText(/Explicação/)).toBeVisible();
    expect(getCategoryQuestions).not.toHaveBeenCalled();
  });

  it('valida no envio, liga os erros aos campos e foca o primeiro invalido', async () => {
    const { user } = renderAt(createUrl);

    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    const statement = screen.getByLabelText('Enunciado');
    expect(statement).toHaveFocus();
    expect(statement).toHaveAttribute('aria-invalid', 'true');
    expect(statement).toHaveAccessibleDescription('Informe o enunciado.');
    expect(screen.getByLabelText('Alternativa 1')).toHaveAccessibleDescription(
      'Informe pelo menos duas alternativas.',
    );
    expect(
      screen.getByRole('radio', { name: 'Marcar alternativa 1 como correta' }),
    ).toHaveAccessibleDescription('Marque exatamente uma alternativa correta.');
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('foca a primeira alternativa vazia quando o enunciado esta valido mas falta alternativa', async () => {
    const { user } = renderAt(createUrl);

    await user.type(screen.getByLabelText('Enunciado'), 'Pergunta válida?');
    await user.type(screen.getByLabelText('Alternativa 1'), 'Opção A');
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(screen.getByLabelText('Alternativa 2')).toHaveFocus();
    expect(screen.getByText('Informe pelo menos duas alternativas.')).toBeVisible();
  });

  it('foca a marcacao de correta quando enunciado e alternativas estao preenchidos', async () => {
    const { user } = renderAt(createUrl);

    await user.type(screen.getByLabelText('Enunciado'), 'Pergunta válida?');
    await user.type(screen.getByLabelText('Alternativa 1'), 'Opção A');
    await user.type(screen.getByLabelText('Alternativa 2'), 'Opção B');
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(screen.getByRole('radio', { name: 'Marcar alternativa 1 como correta' })).toHaveFocus();
    expect(screen.getByText('Marque exatamente uma alternativa correta.')).toBeVisible();
  });

  it('envia o corpo MULTIPLE_CHOICE no POST, mostra o salvamento e segue para a edicao', async () => {
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
      screen.getByRole('heading', { name: 'Editar pergunta: Múltipla escolha' }),
    ).toBeVisible();
    expect(
      await screen.findByDisplayValue('Onde guardar a reserva de emergência?'),
    ).toBeVisible();
  });

  it('mostra o detail do problem+json e preserva os dados quando o POST falha', async () => {
    vi.mocked(createQuestion).mockRejectedValue(
      new ApiError(400, { status: 400, detail: 'Informe pelo menos duas alternativas.' }),
    );
    const { user } = renderAt(createUrl);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Informe pelo menos duas alternativas.',
    );
    expect(screen.getByLabelText('Enunciado')).toHaveValue(
      'Onde guardar a reserva de emergência?',
    );
    expect(screen.getByRole('button', { name: 'Criar rascunho' })).toBeEnabled();
  });
});

describe('MultipleChoiceQuestionPage - edicao', () => {
  it('carrega o rascunho pela lista da categoria e envia o PUT com o corpo MULTIPLE_CHOICE', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    vi.mocked(updateQuestion).mockResolvedValue(
      questionDTO('DRAFT', { ...draftContent, statement: 'Novo enunciado?' }),
    );
    const { user } = renderAt(editUrl);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando pergunta...');
    const statement = await screen.findByLabelText('Enunciado');
    expect(statement).toHaveValue('Onde guardar a reserva de emergência?');
    expect(screen.getByLabelText('Alternativa 1')).toHaveValue(
      'Em investimento de alta liquidez e baixo risco',
    );
    expect(
      screen.getByRole('radio', { name: 'Marcar alternativa 1 como correta' }),
    ).toBeChecked();
    expect(screen.getByText('Rascunho')).toBeVisible();

    await user.clear(statement);
    await user.type(statement, 'Novo enunciado?');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(updateQuestion).toHaveBeenCalledWith('q-mc-1', {
      ...draftContent,
      statement: 'Novo enunciado?',
    });
    expect(await screen.findByText('Rascunho salvo.')).toBeVisible();
  });

  it('edita o rascunho de pergunta publicada, avisando que a versao no ar nao muda', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO('PUBLISHED')]);
    vi.mocked(updateQuestion).mockResolvedValue(
      questionDTO('PUBLISHED_WITH_CHANGES', {
        ...draftContent,
        explanation: 'Nova explicação',
      }),
    );
    const { user } = renderAt(editUrl);

    expect(await screen.findByText(/Esta pergunta está publicada\./)).toBeVisible();
    expect(screen.getByText('Publicada')).toBeVisible();

    const explanation = screen.getByLabelText(/Explicação/);
    await user.clear(explanation);
    await user.type(explanation, 'Nova explicação');
    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(
      await screen.findByText(
        'Rascunho salvo. A versão publicada só muda quando for publicada de novo.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Publicada com alterações')).toBeVisible();
  });

  it('mostra erro de carregamento com opcao de tentar novamente', async () => {
    vi.mocked(getCategoryQuestions)
      .mockRejectedValueOnce(new ApiError(404, { status: 404 }))
      .mockResolvedValueOnce([questionDTO()]);
    const { user } = renderAt(editUrl);

    expect(await screen.findByRole('alert')).toHaveTextContent('Categoria não encontrada.');

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByDisplayValue('Onde guardar a reserva de emergência?'),
    ).toBeVisible();
  });

  it('bloqueia publicar com edicoes nao salvas e libera depois de salvar o rascunho', async () => {
    vi.mocked(getCategoryQuestions).mockResolvedValue([questionDTO()]);
    vi.mocked(updateQuestion).mockResolvedValue(
      questionDTO('DRAFT', { ...draftContent, statement: 'Enunciado atualizado?' }),
    );
    const { user } = renderAt(editUrl);

    const statement = await screen.findByLabelText('Enunciado');
    const publish = screen.getByRole('button', { name: 'Publicar' });
    expect(publish).toBeEnabled();

    await user.clear(statement);
    await user.type(statement, 'Enunciado atualizado?');

    expect(publish).toBeDisabled();
    expect(publish).toHaveAccessibleDescription(
      'Salve o rascunho antes de publicar, voltar para rascunho ou descartar.',
    );

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }));

    expect(await screen.findByText('Rascunho salvo.')).toBeVisible();
    expect(publish).toBeEnabled();
  });
});

