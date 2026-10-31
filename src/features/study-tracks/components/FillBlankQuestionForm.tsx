import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { toFillBlankPayload } from '../api/fillBlankContract';
import {
  BLANK_MARKER,
  fillBlankFieldOrder,
  fillBlankMessages,
  findRepeatedAnswerIndexes,
  hasBlank,
  splitStatement,
  validateFillBlankQuestion,
  validateNewAnswer,
  type FillBlankErrors,
} from '../model/fillBlankValidation';
import type { FillBlankFormValues } from '../types';
import { AcceptedAnswersField } from './AcceptedAnswersField';
import { textAreaClassName } from './textAreaClassName';

type FillBlankQuestionFormProps = {
  initialValues: FillBlankFormValues;
  submitLabel: string;
  isSaving?: boolean;
  onSubmit: (values: FillBlankFormValues) => void;
  /** Avisa quando o formulario passa a ter (ou deixa de ter) edicoes que ainda nao foram salvas. */
  onDirtyChange?: (isDirty: boolean) => void;
};

/** Formulario da pergunta "Preencher lacuna": valida no envio e foca o primeiro campo invalido. */
export function FillBlankQuestionForm({
  initialValues,
  submitLabel,
  isSaving = false,
  onSubmit,
  onDirtyChange,
}: FillBlankQuestionFormProps) {
  const [values, setValues] = useState(initialValues);
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [errors, setErrors] = useState<FillBlankErrors>({});

  // Compara o que seria enviado (textos aparados) com o initialValues atual: depois de salvar, a
  // pergunta salva volta pelo cache e o formulario deixa de ter edicoes pendentes.
  const isDirty =
    JSON.stringify(toFillBlankPayload(values)) !==
      JSON.stringify(toFillBlankPayload(initialValues)) || pendingAnswer.trim() !== '';
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const titleId = useId();
  const statementId = useId();
  const statementHintId = useId();
  const explanationId = useId();
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    statement: useRef<HTMLTextAreaElement>(null),
    answers: useRef<HTMLInputElement>(null),
  };
  const answersListRef = useRef<HTMLUListElement>(null);

  function setField<K extends keyof FillBlankFormValues>(field: K, value: FillBlankFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function addAnswer() {
    const answerError = validateNewAnswer(values.answers, pendingAnswer);
    if (answerError) {
      setErrors((current) => ({ ...current, answers: answerError }));
      return;
    }
    setField('answers', [...values.answers, pendingAnswer.trim()]);
    setPendingAnswer('');
  }

  function removeAnswer(index: number) {
    setField(
      'answers',
      values.answers.filter((_, answerIndex) => answerIndex !== index),
    );
    // O botao removido some da tela: o foco volta para o campo de nova resposta.
    fieldRefs.answers.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }
    const nextErrors = validateFillBlankQuestion(values, pendingAnswer);
    setErrors(nextErrors);

    const firstInvalid = fillBlankFieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      // Respostas repetidas estao na lista: o foco vai para remover a primeira repetida. A posicao
      // vem dos valores, porque a marcacao na lista so aparece no proximo render.
      const [firstRepeated] =
        nextErrors[firstInvalid] === fillBlankMessages.answersDuplicated
          ? findRepeatedAnswerIndexes(values.answers)
          : [];
      const repeatedButton =
        firstRepeated === undefined
          ? null
          : answersListRef.current?.querySelectorAll('button')[firstRepeated];
      (repeatedButton ?? fieldRefs[firstInvalid].current)?.focus();
      return;
    }
    onSubmit(values);
  }

  const statementParts = splitStatement(values.statement);

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={titleId} className="text-sm font-medium">
          Título
        </label>
        <Input
          ref={fieldRefs.title}
          id={titleId}
          type="text"
          value={values.title}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
          onChange={(event) => setField('title', event.target.value)}
        />
        {errors.title && (
          <p id={`${titleId}-error`} className="text-sm text-login-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={statementId} className="text-sm font-medium">
          Enunciado
        </label>
        <p id={statementHintId} className="text-sm text-navy/70">
          Use {BLANK_MARKER} (três underscores) no lugar da lacuna. Ex.: O CDB rende {BLANK_MARKER}{' '}
          do CDI.
        </p>
        <textarea
          ref={fieldRefs.statement}
          id={statementId}
          rows={3}
          value={values.statement}
          aria-invalid={errors.statement ? true : undefined}
          aria-describedby={
            errors.statement ? `${statementHintId} ${statementId}-error` : statementHintId
          }
          onChange={(event) => setField('statement', event.target.value)}
          className={textAreaClassName}
        />
        {errors.statement && (
          <p id={`${statementId}-error`} className="text-sm text-login-error">
            {errors.statement}
          </p>
        )}
        {hasBlank(values.statement) && (
          <div className="rounded-[4px] bg-white px-3 py-2 text-sm">
            <span className="font-medium">Pré-visualização: </span>
            {statementParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < statementParts.length - 1 && (
                  <span className="mx-1 inline-block w-16 border-b-2 border-navy align-baseline">
                    <span className="sr-only">lacuna</span>
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <AcceptedAnswersField
        answers={values.answers}
        pendingAnswer={pendingAnswer}
        error={errors.answers}
        errorOnList={errors.answers === fillBlankMessages.answersDuplicated}
        inputRef={fieldRefs.answers}
        listRef={answersListRef}
        onPendingAnswerChange={(value) => {
          setPendingAnswer(value);
          setErrors((current) => ({ ...current, answers: undefined }));
        }}
        onAdd={addAnswer}
        onRemove={removeAnswer}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={explanationId} className="text-sm font-medium">
          Explicação <span className="font-normal text-navy/70">(opcional)</span>
        </label>
        <textarea
          id={explanationId}
          rows={3}
          value={values.explanation}
          onChange={(event) => setField('explanation', event.target.value)}
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
