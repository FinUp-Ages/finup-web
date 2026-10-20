import { useId, type Ref } from 'react';
import { fieldClassName } from './fieldClassName';

type AcceptedAnswersFieldProps = {
  answers: string[];
  pendingAnswer: string;
  error?: string;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onPendingAnswerChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

/**
 * Lista de respostas aceitas: adiciona pelo campo (Enter ou botao) e remove por item.
 * A ultima resposta nao pode ser removida, para a pergunta nunca ficar sem resposta.
 */
export function AcceptedAnswersField({
  answers,
  pendingAnswer,
  error,
  disabled = false,
  inputRef,
  onPendingAnswerChange,
  onAdd,
  onRemove,
}: AcceptedAnswersFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const isLastAnswer = answers.length === 1;

  return (
    <div className="flex flex-col gap-2">
      {disabled ? (
        <p className="text-sm font-medium">Respostas aceitas</p>
      ) : (
        <label htmlFor={inputId} className="text-sm font-medium">
          Respostas aceitas
        </label>
      )}
      {!disabled && (
        <p id={hintId} className="text-sm text-navy/70">
          Cada resposta aceita completa a lacuna. Pressione Enter ou use Adicionar.
          {isLastAnswer && ' Mantenha pelo menos uma resposta.'}
        </p>
      )}

      {answers.length > 0 && (
        <ul aria-label="Respostas aceitas adicionadas" className="flex flex-wrap gap-2">
          {answers.map((answer, index) => (
            <li
              key={`${index}-${answer}`}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-3 pr-1 text-sm"
            >
              <span>{answer}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remover resposta "${answer}"`}
                  disabled={isLastAnswer}
                  onClick={() => onRemove(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-navy hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={pendingAnswer}
            placeholder="Ex.: 100%"
            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onPendingAnswerChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Enter adiciona a resposta em vez de enviar o formulario.
                event.preventDefault();
                onAdd();
              }
            }}
            className={`h-11 ${fieldClassName}`}
          />
          <button
            type="button"
            onClick={onAdd}
            className="h-11 shrink-0 rounded-[4px] border border-navy bg-white px-4 text-sm font-medium text-navy hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Adicionar
          </button>
        </div>
      )}

      {error && (
        <p id={errorId} className="text-sm text-login-error">
          {error}
        </p>
      )}
    </div>
  );
}
