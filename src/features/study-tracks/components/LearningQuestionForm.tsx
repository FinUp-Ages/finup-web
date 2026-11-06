import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { toLearningPayload } from '../api/learningContract';
import {
  learningFieldOrder,
  validateLearningQuestion,
  type LearningErrors,
} from '../model/learningValidation';
import type { LearningFormValues } from '../types';
import { MarkdownPreview } from './MarkdownPreview';
import { textAreaClassName } from './textAreaClassName';

type LearningQuestionFormProps = {
  initialValues: LearningFormValues;
  submitLabel: string;
  isSaving?: boolean;
  onSubmit: (values: LearningFormValues) => void;
  /** Avisa quando o formulario passa a ter (ou deixa de ter) edicoes que ainda nao foram salvas. */
  onDirtyChange?: (isDirty: boolean) => void;
};

type BodyTab = 'write' | 'preview';

const tabClassName = (isActive: boolean) =>
  `rounded px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
    isActive ? 'bg-white text-navy shadow-sm' : 'text-navy/70 hover:text-navy'
  }`;

/**
 * Formulário da pergunta "Conteúdo explicativo" (LEARNING).
 * Valida título e corpo em markdown no envio e foca o primeiro campo inválido.
 * O corpo tem as abas "Escrever" e "Pré-visualizar"; o textarea fica sempre montado (só oculto)
 * para o rótulo e o foco continuarem apontando para ele.
 */
export function LearningQuestionForm({
  initialValues,
  submitLabel,
  isSaving = false,
  onSubmit,
  onDirtyChange,
}: LearningQuestionFormProps) {
  const [values, setValues] = useState<LearningFormValues>(initialValues);
  const [errors, setErrors] = useState<LearningErrors>({});
  const [activeTab, setActiveTab] = useState<BodyTab>('write');

  const isDirty =
    JSON.stringify(toLearningPayload(values)) !==
    JSON.stringify(toLearningPayload(initialValues));
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const titleId = useId();
  const bodyId = useId();
  const writeTabId = `${bodyId}-tab-write`;
  const previewTabId = `${bodyId}-tab-preview`;

  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
  };
  const tabRefs = {
    write: useRef<HTMLButtonElement>(null),
    preview: useRef<HTMLButtonElement>(null),
  };

  function setField<K extends keyof LearningFormValues>(field: K, value: LearningFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }
    event.preventDefault();
    const next: BodyTab =
      event.key === 'Home'
        ? 'write'
        : event.key === 'End'
          ? 'preview'
          : activeTab === 'write'
            ? 'preview'
            : 'write';
    setActiveTab(next);
    tabRefs[next].current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationErrors = validateLearningQuestion(values);
    setErrors(validationErrors);

    const firstInvalid = learningFieldOrder.find((field) => validationErrors[field]);
    if (!firstInvalid) {
      onSubmit(values);
      return;
    }

    // O erro do corpo precisa do campo visivel: volta para "Escrever" antes de mover o foco.
    if (validationErrors.body && activeTab !== 'write') {
      flushSync(() => setActiveTab('write'));
    }
    fieldRefs[firstInvalid].current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 text-navy">
      <div className="flex flex-col gap-2">
        <label htmlFor={titleId} className="text-sm font-medium">
          Título
        </label>
        <Input
          ref={fieldRefs.title}
          id={titleId}
          type="text"
          value={values.title}
          placeholder="Ex: Por que ter uma reserva de emergência?"
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
        <div className="flex items-center justify-between">
          <label htmlFor={bodyId} className="text-sm font-medium">
            Corpo do conteúdo (Markdown)
          </label>
          <div
            role="tablist"
            aria-label="Modo de edição do corpo"
            onKeyDown={handleTabKeyDown}
            className="flex rounded-md border border-black/10 bg-black/5 p-0.5 text-xs font-medium"
          >
            <button
              ref={tabRefs.write}
              type="button"
              role="tab"
              id={writeTabId}
              aria-controls={`${bodyId}-panel-write`}
              aria-selected={activeTab === 'write'}
              tabIndex={activeTab === 'write' ? 0 : -1}
              onClick={() => setActiveTab('write')}
              className={tabClassName(activeTab === 'write')}
            >
              Escrever
            </button>
            <button
              ref={tabRefs.preview}
              type="button"
              role="tab"
              id={previewTabId}
              aria-controls={`${bodyId}-panel-preview`}
              aria-selected={activeTab === 'preview'}
              tabIndex={activeTab === 'preview' ? 0 : -1}
              onClick={() => setActiveTab('preview')}
              className={tabClassName(activeTab === 'preview')}
            >
              Pré-visualizar
            </button>
          </div>
        </div>

        <div
          id={`${bodyId}-panel-write`}
          role="tabpanel"
          aria-labelledby={writeTabId}
          hidden={activeTab !== 'write'}
        >
          <textarea
            ref={fieldRefs.body}
            id={bodyId}
            rows={12}
            value={values.body}
            placeholder="Digite o texto explicativo em Markdown. Suporta títulos (#), negrito (**), listas (-), código e citações..."
            aria-invalid={errors.body ? true : undefined}
            aria-describedby={errors.body ? `${bodyId}-error` : undefined}
            onChange={(event) => setField('body', event.target.value)}
            className={textAreaClassName}
          />
        </div>
        <div
          id={`${bodyId}-panel-preview`}
          role="tabpanel"
          aria-labelledby={previewTabId}
          hidden={activeTab !== 'preview'}
        >
          {activeTab === 'preview' && <MarkdownPreview content={values.body} />}
        </div>

        {errors.body && (
          <p id={`${bodyId}-error`} className="text-sm text-login-error">
            {errors.body}
          </p>
        )}
      </div>

      <div className="w-[240px]">
        <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
          {isSaving ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
