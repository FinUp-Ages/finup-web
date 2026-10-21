import { useId, type Ref } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { findRepeatedAnswerIndexes } from '../model/fillBlankValidation';

type AcceptedAnswersFieldProps = {
  answers: string[];
  pendingAnswer: string;
  error?: string;
  /** O erro e de respostas repetidas na lista, nao do campo de nova resposta. */
  errorOnList?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  listRef?: Ref<HTMLUListElement>;
  onPendingAnswerChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

/**
 * Lista de respostas aceitas: adiciona pelo campo (Enter ou botao) e remove por item.
 * A ultima resposta nao pode ser removida, para a pergunta nunca ficar sem resposta.
 * Com erro de repeticao, as respostas repetidas ficam marcadas na lista.
 */
export function AcceptedAnswersField({
  answers,
  pendingAnswer,
  error,
  errorOnList = false,
  inputRef,
  listRef,
  onPendingAnswerChange,
  onAdd,
  onRemove,
}: AcceptedAnswersFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const isLastAnswer = answers.length === 1;
  const repeatedIndexes = errorOnList ? findRepeatedAnswerIndexes(answers) : new Set<number>();
  const inputError = error && !errorOnList;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        Respostas aceitas
      </label>
      <p id={hintId} className="text-sm text-navy/70">
        Cada resposta aceita completa a lacuna. Pressione Enter ou use Adicionar.
        {isLastAnswer && ' Mantenha pelo menos uma resposta.'}
      </p>

      {answers.length > 0 && (
        <ul
          ref={listRef}
          aria-label="Respostas aceitas adicionadas"
          aria-describedby={error && errorOnList ? errorId : undefined}
          className="flex flex-wrap gap-2"
        >
          {answers.map((answer, index) => {
            const isRepeated = repeatedIndexes.has(index);
            return (
              <li
                key={`${index}-${answer}`}
                className={`flex items-center gap-2 rounded-full border bg-white py-1 pl-3 pr-1 text-sm ${
                  isRepeated ? 'border-login-error' : 'border-black/10'
                }`}
              >
                <span>{answer}</span>
                {isRepeated && <span className="text-xs text-login-error">repetida</span>}
                <button
                  type="button"
                  aria-label={
                    isRepeated
                      ? `Remover resposta repetida "${answer}"`
                      : `Remover resposta "${answer}"`
                  }
                  disabled={isLastAnswer}
                  onClick={() => onRemove(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-navy hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          value={pendingAnswer}
          aria-describedby={inputError ? `${hintId} ${errorId}` : hintId}
          aria-invalid={inputError ? true : undefined}
          onChange={(event) => onPendingAnswerChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              // Enter adiciona a resposta em vez de enviar o formulario.
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <button
          type="button"
          onClick={onAdd}
          className="h-[50px] shrink-0 rounded-md border border-navy bg-white px-5 text-sm font-medium text-navy hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          Adicionar
        </button>
      </div>

      {error && (
        <p id={errorId} className="text-sm text-login-error">
          {error}
        </p>
      )}
    </div>
  );
}
