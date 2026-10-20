/**
 * Regras da pergunta "Preencher lacuna", sem React e sem rede.
 *
 * - O enunciado marca a lacuna com ___ (tres underscores) e precisa de pelo menos uma.
 *   PREMISSA: o C6 nao limita a quantidade de lacunas.
 * - Respostas aceitas sao aparadas; vazias nao entram. Duplicatas sao comparadas sem
 *   diferenciar maiusculas de minusculas (pt-BR): "CDI" e "cdi" sao a mesma resposta.
 *   PREMISSA: o C6 nao define se a correcao diferencia maiusculas.
 */
import type { FillBlankFormValues } from '../types';

export const BLANK_MARKER = '___';

export type FillBlankField = 'title' | 'statement' | 'answers';

export type FillBlankErrors = Partial<Record<FillBlankField, string>>;

/** Ordem dos campos na tela: o foco vai para o primeiro invalido. */
export const fillBlankFieldOrder: FillBlankField[] = ['title', 'statement', 'answers'];

export const fillBlankMessages = {
  titleRequired: 'Informe o título.',
  statementRequired: 'Informe o enunciado.',
  statementWithoutBlank: `Marque a lacuna no enunciado com ${BLANK_MARKER} (três underscores).`,
  answersRequired: 'Adicione pelo menos uma resposta aceita.',
  answersDuplicated: 'Remova as respostas aceitas repetidas.',
  answerEmpty: 'Digite a resposta antes de adicionar.',
  answerDuplicated: 'Essa resposta já foi adicionada.',
  answerPending: 'Adicione a resposta digitada ou apague o campo.',
} as const;

function toAnswerKey(answer: string): string {
  return answer.trim().toLocaleLowerCase('pt-BR');
}

export function hasBlank(statement: string): boolean {
  return statement.includes(BLANK_MARKER);
}

/** Erro ao tentar adicionar `candidate` a lista, ou null se pode entrar. */
export function validateNewAnswer(answers: string[], candidate: string): string | null {
  const key = toAnswerKey(candidate);
  if (!key) {
    return fillBlankMessages.answerEmpty;
  }
  if (answers.some((answer) => toAnswerKey(answer) === key)) {
    return fillBlankMessages.answerDuplicated;
  }
  return null;
}

/**
 * Valida o formulario inteiro. `pendingAnswer` e o texto ainda nao adicionado a lista:
 * salvar com ele preenchido perderia a resposta sem aviso.
 */
export function validateFillBlankQuestion(
  values: FillBlankFormValues,
  pendingAnswer = '',
): FillBlankErrors {
  const errors: FillBlankErrors = {};
  const statement = values.statement.trim();
  const answerKeys = values.answers.map(toAnswerKey).filter(Boolean);

  if (!values.title.trim()) {
    errors.title = fillBlankMessages.titleRequired;
  }

  if (!statement) {
    errors.statement = fillBlankMessages.statementRequired;
  } else if (!hasBlank(statement)) {
    errors.statement = fillBlankMessages.statementWithoutBlank;
  }

  if (pendingAnswer.trim()) {
    errors.answers = fillBlankMessages.answerPending;
  } else if (answerKeys.length === 0) {
    errors.answers = fillBlankMessages.answersRequired;
  } else if (new Set(answerKeys).size !== answerKeys.length) {
    errors.answers = fillBlankMessages.answersDuplicated;
  }

  return errors;
}

/** Trechos do enunciado entre as lacunas, para a pre-visualizacao. */
export function splitStatement(statement: string): string[] {
  return statement.split(BLANK_MARKER);
}
