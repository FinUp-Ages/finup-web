import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { toMultipleChoicePayload } from '../api/multipleChoiceContract';
import {
  findEmptyOptionIndexes,
  findRepeatedOptionIndexes,
  multipleChoiceFieldOrder,
  multipleChoiceMessages,
  validateMultipleChoiceQuestion,
  type MultipleChoiceErrors,
} from '../model/multipleChoiceValidation';
import type { MultipleChoiceFormValues } from '../types';
import { textAreaClassName } from './textAreaClassName';

type MultipleChoiceQuestionFormProps = {
  initialValues: MultipleChoiceFormValues;
  submitLabel: string;
  isSaving?: boolean;
  onSubmit: (values: MultipleChoiceFormValues) => void;
  /** Avisa quando o formulario passa a ter (ou deixa de ter) edicoes que ainda nao foram salvas. */
  onDirtyChange?: (isDirty: boolean) => void;
};

/**
 * Formulario da pergunta "Objetiva" (Múltipla escolha):
 * valida no envio (enunciado, pelo menos duas alternativas e exatamente uma correta)
 * e move o foco para o primeiro controle invalido.
 */
export function MultipleChoiceQuestionForm({
  initialValues,
  submitLabel,
  isSaving = false,
  onSubmit,
  onDirtyChange,
}: MultipleChoiceQuestionFormProps) {
  const [values, setValues] = useState<MultipleChoiceFormValues>(initialValues);
  const [errors, setErrors] = useState<MultipleChoiceErrors>({});

  const isDirty =
    JSON.stringify(toMultipleChoicePayload(values)) !==
    JSON.stringify(toMultipleChoicePayload(initialValues));
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const statementId = useId();
  const optionsGroupId = useId();
  const optionsHintId = useId();
  const optionsErrorId = useId();
  const correctErrorId = useId();
  const explanationId = useId();
  const correctRadioGroupName = useId();

  const statementRef = useRef<HTMLTextAreaElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const radioRefs = useRef<(HTMLInputElement | null)[]>([]);
  const addOptionButtonRef = useRef<HTMLButtonElement>(null);

  function setStatement(statement: string) {
    setValues((current) => ({ ...current, statement }));
    if (errors.statement) {
      setErrors((current) => ({ ...current, statement: undefined }));
    }
  }

  function setExplanation(explanation: string) {
    setValues((current) => ({ ...current, explanation }));
  }

  function updateOptionText(index: number, text: string) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, text } : option,
      ),
    }));
    if (errors.options) {
      setErrors((current) => ({ ...current, options: undefined }));
    }
  }

  function selectCorrectOption(index: number) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      })),
    }));
    if (errors.correctOption) {
      setErrors((current) => ({ ...current, correctOption: undefined }));
    }
  }

  function addOption() {
    setValues((current) => ({
      ...current,
      options: [...current.options, { text: '', correct: false }],
    }));
    if (errors.options) {
      setErrors((current) => ({ ...current, options: undefined }));
    }
  }

  function removeOption(index: number) {
    setValues((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }));
    if (errors.options) {
      setErrors((current) => ({ ...current, options: undefined }));
    }
    addOptionButtonRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const nextErrors = validateMultipleChoiceQuestion(values);
    setErrors(nextErrors);

    const firstInvalid = multipleChoiceFieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      if (firstInvalid === 'statement') {
        statementRef.current?.focus();
      } else if (firstInvalid === 'options') {
        if (nextErrors.options === multipleChoiceMessages.optionsDuplicated) {
          const [firstRepeated] = findRepeatedOptionIndexes(values.options);
          const target =
            firstRepeated !== undefined ? optionInputRefs.current[firstRepeated] : null;
          (target ?? optionInputRefs.current[0] ?? addOptionButtonRef.current)?.focus();
        } else {
          const [firstEmpty] = findEmptyOptionIndexes(values.options);
          const target = firstEmpty !== undefined ? optionInputRefs.current[firstEmpty] : null;
          (target ?? addOptionButtonRef.current ?? optionInputRefs.current[0])?.focus();
        }
      } else if (firstInvalid === 'correctOption') {
        (radioRefs.current[0] ?? addOptionButtonRef.current)?.focus();
      }
      return;
    }

    onSubmit(values);
  }

  const emptyIndexes = errors.options ? findEmptyOptionIndexes(values.options) : new Set<number>();
  const repeatedIndexes =
    errors.options === multipleChoiceMessages.optionsDuplicated
      ? findRepeatedOptionIndexes(values.options)
      : new Set<number>();

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={statementId} className="text-sm font-medium">
          Enunciado
        </label>
        <textarea
          ref={statementRef}
          id={statementId}
          rows={3}
          value={values.statement}
          aria-invalid={errors.statement ? true : undefined}
          aria-describedby={errors.statement ? `${statementId}-error` : undefined}
          onChange={(event) => setStatement(event.target.value)}
          className={textAreaClassName}
        />
        {errors.statement && (
          <p id={`${statementId}-error`} className="text-sm text-login-error">
            {errors.statement}
          </p>
        )}
      </div>

      <fieldset aria-describedby={optionsHintId} className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Alternativas</legend>
        <p id={optionsHintId} className="text-sm text-navy/70">
          Adicione pelo menos duas alternativas e marque a única correta.
        </p>

        {values.options.length > 0 && (
          <ul aria-label="Lista de alternativas" className="flex flex-col gap-3">
            {values.options.map((option, index) => {
              const number = index + 1;
              const optionInputId = `${optionsGroupId}-option-${index}`;
              const optionRadioId = `${optionsGroupId}-correct-${index}`;
              const isOptionEmpty = emptyIndexes.has(index);
              const isOptionRepeated = repeatedIndexes.has(index);
              const isOptionInvalid = Boolean(
                errors.options && (isOptionEmpty || isOptionRepeated),
              );

              return (
                <li
                  key={index}
                  className={`flex flex-col gap-2 rounded-[4px] border bg-white p-3 ${
                    isOptionInvalid ? 'border-login-error' : 'border-black/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={optionInputId} className="text-sm font-medium">
                      Alternativa {number}
                    </label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={optionRadioId}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-navy"
                      >
                        <input
                          ref={(element) => {
                            radioRefs.current[index] = element;
                          }}
                          id={optionRadioId}
                          type="radio"
                          name={correctRadioGroupName}
                          checked={option.correct}
                          aria-label={`Marcar alternativa ${number} como correta`}
                          aria-describedby={errors.correctOption ? correctErrorId : undefined}
                          onChange={() => selectCorrectOption(index)}
                          className="h-4 w-4 cursor-pointer accent-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                        />
                        <span>Correta</span>
                      </label>
                      <button
                        type="button"
                        aria-label={`Remover alternativa ${number}`}
                        onClick={() => removeOption(index)}
                        className="rounded px-2 py-1 text-xs font-medium text-navy/80 hover:bg-slate-100 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <Input
                    ref={(element) => {
                      optionInputRefs.current[index] = element;
                    }}
                    id={optionInputId}
                    type="text"
                    value={option.text}
                    aria-invalid={isOptionInvalid ? true : undefined}
                    aria-describedby={errors.options ? optionsErrorId : undefined}
                    onChange={(event) => updateOptionText(index, event.target.value)}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <div>
          <button
            ref={addOptionButtonRef}
            type="button"
            onClick={addOption}
            className="h-[42px] rounded-md border border-navy bg-white px-4 text-sm font-medium text-navy hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Adicionar alternativa
          </button>
        </div>

        {errors.options && (
          <p id={optionsErrorId} className="text-sm text-login-error">
            {errors.options}
          </p>
        )}

        {errors.correctOption && (
          <p id={correctErrorId} className="text-sm text-login-error">
            {errors.correctOption}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={explanationId} className="text-sm font-medium">
          Explicação <span className="font-normal text-navy/70">(opcional)</span>
        </label>
        <textarea
          id={explanationId}
          rows={3}
          value={values.explanation}
          onChange={(event) => setExplanation(event.target.value)}
          className={textAreaClassName}
        />
      </div>

      <div className="w-[240px]">
        <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
          {isSaving ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

