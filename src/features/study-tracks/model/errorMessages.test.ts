import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/config/apiError';
import {
  toDeleteCategoryErrorMessage,
  toLoadCategoriesErrorMessage,
  toSaveCategoryErrorMessage,
} from './categoryErrorMessages';
import {
  toDiscardDraftErrorMessage,
  toLoadCategoryQuestionsErrorMessage,
  toLoadQuestionErrorMessage,
  toPublishQuestionErrorMessage,
  toSaveQuestionErrorMessage,
  toUnpublishQuestionErrorMessage,
} from './questionErrorMessages';

const OFFLINE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const offline = new ApiError(null, null);
const withDetail = (status: number) => new ApiError(status, { status, detail: `regra ${status}` });
const bare = (status: number) => new ApiError(status, null);

describe('mensagens de erro das categorias', () => {
  it.each([
    [offline, OFFLINE],
    [bare(403), 'Você não tem permissão para ver as categorias.'],
    [bare(500), 'Não foi possível carregar as categorias.'],
    [new Error('x'), 'Não foi possível carregar as categorias.'],
  ])('carregar: %s', (error, message) => {
    expect(toLoadCategoriesErrorMessage(error)).toBe(message);
  });

  it.each([
    [offline, OFFLINE],
    [bare(404), 'Categoria não encontrada. Ela pode ter sido removida.'],
    [bare(403), 'Você não tem permissão para salvar categorias.'],
    [withDetail(400), 'regra 400'],
    [withDetail(409), 'regra 409'],
    [withDetail(422), 'regra 422'],
    [withDetail(500), 'Não foi possível salvar a categoria. Tente novamente.'],
    [bare(400), 'Não foi possível salvar a categoria. Tente novamente.'],
    [new Error('x'), 'Não foi possível salvar a categoria. Tente novamente.'],
  ])('salvar: %s', (error, message) => {
    expect(toSaveCategoryErrorMessage(error)).toBe(message);
  });

  it.each([
    [offline, OFFLINE],
    [withDetail(409), 'regra 409'],
    [bare(409), 'A categoria possui perguntas e não pode ser removida. Remova as perguntas antes.'],
    [bare(404), 'Categoria não encontrada. Ela pode já ter sido removida.'],
    [bare(403), 'Você não tem permissão para remover categorias.'],
    [bare(500), 'Não foi possível remover a categoria. Tente novamente.'],
    [new Error('x'), 'Não foi possível remover a categoria. Tente novamente.'],
  ])('remover: %s', (error, message) => {
    expect(toDeleteCategoryErrorMessage(error)).toBe(message);
  });
});

describe('mensagens de erro das perguntas', () => {
  it.each([
    [toLoadQuestionErrorMessage, offline, OFFLINE],
    [toLoadQuestionErrorMessage, bare(404), 'Categoria não encontrada.'],
    [toLoadQuestionErrorMessage, bare(403), 'Você não tem permissão para acessar esta pergunta.'],
    [toLoadQuestionErrorMessage, bare(500), 'Não foi possível carregar a pergunta.'],
    [toLoadQuestionErrorMessage, new Error('x'), 'Não foi possível carregar a pergunta.'],
    [toLoadCategoryQuestionsErrorMessage, offline, OFFLINE],
    [toLoadCategoryQuestionsErrorMessage, bare(404), 'Categoria não encontrada.'],
    [
      toLoadCategoryQuestionsErrorMessage,
      bare(403),
      'Você não tem permissão para acessar as perguntas desta categoria.',
    ],
    [
      toLoadCategoryQuestionsErrorMessage,
      new Error('x'),
      'Não foi possível carregar as perguntas. Tente novamente.',
    ],
  ])('carregar com %o', (toMessage, error, message) => {
    expect(toMessage(error)).toBe(message);
  });

  // Mesmo formato para salvar, publicar, despublicar e descartar: sem rede, sem permissao,
  // 404 com e sem detail, erro de regra com detail e o texto padrao.
  it.each([
    [
      'salvar',
      toSaveQuestionErrorMessage,
      'Você não tem permissão para salvar esta pergunta.',
      'Pergunta ou categoria não encontrada.',
      'Não foi possível salvar a pergunta. Tente novamente.',
      'Não foi possível salvar a pergunta. Tente novamente.',
    ],
    [
      'publicar',
      toPublishQuestionErrorMessage,
      'Você não tem permissão para publicar esta pergunta.',
      'Pergunta não encontrada.',
      'Não foi possível publicar a pergunta. Verifique os dados e tente novamente.',
      'Não foi possível publicar a pergunta. Tente novamente.',
    ],
    [
      'despublicar',
      toUnpublishQuestionErrorMessage,
      'Você não tem permissão para despublicar esta pergunta.',
      'Pergunta não encontrada.',
      'Não foi possível voltar a pergunta para rascunho. Tente novamente.',
      'Não foi possível voltar a pergunta para rascunho. Tente novamente.',
    ],
    [
      'descartar',
      toDiscardDraftErrorMessage,
      'Você não tem permissão para descartar as alterações.',
      'Pergunta não encontrada.',
      'Não foi possível descartar as alterações do rascunho. Tente novamente.',
      'Não foi possível descartar as alterações do rascunho. Tente novamente.',
    ],
  ])('%s', (_, toMessage, forbidden, notFound, fallback, unknown) => {
    expect(toMessage(offline)).toBe(OFFLINE);
    expect(toMessage(bare(403))).toBe(forbidden);
    expect(toMessage(bare(404))).toBe(notFound);
    expect(toMessage(withDetail(404))).toBe('regra 404');
    expect(toMessage(withDetail(422))).toBe('regra 422');
    expect(toMessage(withDetail(409))).toBe(fallback);
    expect(toMessage(bare(500))).toBe(fallback);
    expect(toMessage(new Error('x'))).toBe(unknown);
  });
});
