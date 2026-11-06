/**
 * Regras de validacao da pergunta "Objetiva" (MULTIPLE_CHOICE), sem React e sem rede.
 *
 * - Enunciado obrigatorio.
 * - Pelo menos duas alternativas com texto preenchido e sem repeticoes (case-insensitive pt-BR).
 * - Exatamente uma alternativa marcada como correta.
 */
import type { MultipleChoiceFormValues, MultipleChoiceOptionDTO } from '../types';

export type MultipleChoiceField = 'statement' | 'options' | 'correctOption';

export type MultipleChoiceErrors = Partial<Record<MultipleChoiceField, string>>;

/** Ordem dos campos na tela: o foco vai para o primeiro invalido. */
export const multipleChoiceFieldOrder: MultipleChoiceField[] = [
  'statement',
  'options',
  'correctOption',
];

export const multipleChoiceMessages = {
  statementRequired: 'Informe o enunciado.',
  optionsMinCount: 'Informe pelo menos duas alternativas.',
  optionTextRequired: 'Preencha o texto de todas as alternativas.',
  optionsDuplicated: 'Remova ou altere as alternativas repetidas.',
  correctOptionRequired: 'Marque exatamente uma alternativa correta.',
} as const;

function toOptionKey(text: string): string {
  return text.trim().toLocaleLowerCase('pt-BR');
}

/** Indices das alternativas cujo texto esta em branco. */
export function findEmptyOptionIndexes(options: MultipleChoiceOptionDTO[]): Set<number> {
  const empty = new Set<number>();
  options.forEach((option, index) => {
    if (!option.text.trim()) {
      empty.add(index);
    }
  });
  return empty;
}

/** Indices das alternativas que repetem o texto de uma anterior. */
export function findRepeatedOptionIndexes(options: MultipleChoiceOptionDTO[]): Set<number> {
  const seen = new Set<string>();
  const repeated = new Set<number>();
  options.forEach((option, index) => {
    const key = toOptionKey(option.text);
    if (!key) {
      return;
    }
    if (seen.has(key)) {
      repeated.add(index);
    }
    seen.add(key);
  });
  return repeated;
}

/** Valida os valores do formulario de pergunta "Objetiva" (MULTIPLE_CHOICE). */
export function validateMultipleChoiceQuestion(
  values: Pick<MultipleChoiceFormValues, 'statement' | 'options'>,
): MultipleChoiceErrors {
  const errors: MultipleChoiceErrors = {};
  const statement = values.statement.trim();
  const options = values.options;
  const filledCount = options.filter((option) => option.text.trim().length > 0).length;
  const emptyIndexes = findEmptyOptionIndexes(options);
  const repeatedIndexes = findRepeatedOptionIndexes(options);
  const correctCount = options.filter((option) => option.correct).length;

  if (!statement) {
    errors.statement = multipleChoiceMessages.statementRequired;
  }

  if (options.length < 2 || filledCount < 2) {
    errors.options = multipleChoiceMessages.optionsMinCount;
  } else if (emptyIndexes.size > 0) {
    errors.options = multipleChoiceMessages.optionTextRequired;
  } else if (repeatedIndexes.size > 0) {
    errors.options = multipleChoiceMessages.optionsDuplicated;
  }

  if (correctCount !== 1) {
    errors.correctOption = multipleChoiceMessages.correctOptionRequired;
  }

  return errors;
}

