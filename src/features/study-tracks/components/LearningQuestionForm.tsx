import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
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
};

/**
 * Formulário da pergunta "Conteúdo explicativo" (LEARNING).
 * Valida título e corpo em markdown no envio e foca o primeiro campo inválido.
 * Oferece abas de edição ("Escrever") e pré-visualização ("Pré-visualizar").
 */
export function LearningQuestionForm({
  initialValues,
  submitLabel,
  isSaving = false,
  onSubmit,
}: LearningQuestionFormProps) {
  const [values, setValues] = useState<LearningFormValues>(initialValues);
  const [errors, setErrors] = useState<LearningErrors>({});
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const titleId = useId();
  const bodyId = useId();

  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
  };

  function setField<K extends keyof LearningFormValues>(field: K, value: LearningFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateLearningQuestion(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Se o erro for no corpo e o usuário estiver na aba de pré-visualização, volta para a aba de escrita
      if (validationErrors.body && !validationErrors.title) {
        setActiveTab('write');
      }

      for (const field of learningFieldOrder) {
        if (validationErrors[field]) {
          fieldRefs[field].current?.focus();
          break;
        }
      }
      return;
    }

    setErrors({});
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 text-navy">
      {/* Campo de Título */}
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
          <p id={`${titleId}-error`} role="alert" className="text-xs text-login-error">
            {errors.title}
          </p>
        )}
      </div>

      {/* Campo de Corpo com Abas Escrever / Pré-visualizar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor={bodyId} className="text-sm font-medium">
            Corpo do conteúdo (Markdown)
          </label>
          <div
            role="tablist"
            aria-label="Modo de edição do corpo"
            className="flex rounded-md border border-black/10 bg-black/5 p-0.5 text-xs font-medium"
          >
            <button
              type="button"
              role="tab"
              id={`${bodyId}-tab-write`}
              aria-controls={`${bodyId}-panel-write`}
              aria-selected={activeTab === 'write'}
              onClick={() => setActiveTab('write')}
              className={`rounded px-3 py-1 transition-colors ${
                activeTab === 'write'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-navy/70 hover:text-navy'
              }`}
            >
              Escrever
            </button>
            <button
              type="button"
              role="tab"
              id={`${bodyId}-tab-preview`}
              aria-controls={`${bodyId}-panel-preview`}
              aria-selected={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              className={`rounded px-3 py-1 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-navy/70 hover:text-navy'
              }`}
            >
              Pré-visualizar
            </button>
          </div>
        </div>

        {activeTab === 'write' ? (
          <div id={`${bodyId}-panel-write`} role="tabpanel" aria-labelledby={`${bodyId}-tab-write`}>
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
        ) : (
          <div
            id={`${bodyId}-panel-preview`}
            role="tabpanel"
            aria-labelledby={`${bodyId}-tab-preview`}
          >
            <MarkdownPreview content={values.body} />
          </div>
        )}

        {errors.body && (
          <p id={`${bodyId}-error`} role="alert" className="text-xs text-login-error">
            {errors.body}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
