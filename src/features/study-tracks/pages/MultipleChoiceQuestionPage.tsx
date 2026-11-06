/**
 * Criacao e edicao do rascunho de uma pergunta "Objetiva" (Múltipla escolha - MULTIPLE_CHOICE).
 *
 * Sem :questionId na rota, cria (POST) na categoria e segue para a edicao do rascunho criado.
 * Com :questionId, carrega a pergunta pela lista da categoria e salva com PUT. O PUT so altera o
 * rascunho, em qualquer status: numa pergunta publicada, a versao no ar so muda ao publicar.
 * Os caminhos vem por props: features nao importam app/.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MultipleChoiceQuestionForm } from '../components/MultipleChoiceQuestionForm';
import { QuestionStatusActions } from '../components/QuestionStatusActions';
import { useMultipleChoiceQuestion } from '../hooks/useMultipleChoiceQuestion';
import { useSaveMultipleChoiceQuestion } from '../hooks/useSaveMultipleChoiceQuestion';
import { questionStatusLabels, questionTypeLabels } from '../model/questionLabels';
import type { MultipleChoiceFormValues } from '../types';

type MultipleChoiceQuestionPageProps = {
  /** Tela da Trilha de estudos, destino do link de voltar. */
  backTo: string | ((categoryId: string) => string);
  backLabel?: string;
  /** Caminho de edicao de uma pergunta, usado depois de criar. */
  editPathFor: (categoryId: string, questionId: string) => string;
};

type LocationState = { created?: boolean } | null;

const emptyValues: MultipleChoiceFormValues = {
  statement: '',
  options: [
    { text: '', correct: false },
    { text: '', correct: false },
  ],
  explanation: '',
};

export function MultipleChoiceQuestionPage(props: MultipleChoiceQuestionPageProps) {
  const { categoryId = '', questionId } = useParams();
  return (
    <MultipleChoiceQuestionScreen
      key={`${categoryId}/${questionId ?? 'new'}`}
      categoryId={categoryId}
      questionId={questionId}
      {...props}
    />
  );
}

type MultipleChoiceQuestionScreenProps = MultipleChoiceQuestionPageProps & {
  categoryId: string;
  questionId: string | undefined;
};

function MultipleChoiceQuestionScreen({
  backTo,
  backLabel = 'Trilha de estudos',
  editPathFor,
  categoryId,
  questionId,
}: MultipleChoiceQuestionScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = Boolean(questionId);

  const {
    question,
    isLoading,
    errorMessage: loadErrorMessage,
    reload,
  } = useMultipleChoiceQuestion(categoryId, questionId);
  const {
    save,
    isSaving,
    errorMessage: saveErrorMessage,
  } = useSaveMultipleChoiceQuestion({ categoryId, questionId });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formRevision, setFormRevision] = useState(0);

  useEffect(() => {
    if ((location.state as LocationState)?.created) {
      setSuccessMessage('Pergunta criada como rascunho.');
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  function handleSubmit(values: MultipleChoiceFormValues) {
    setSuccessMessage(null);
    save(values, (saved) => {
      if (!isEditing) {
        navigate(editPathFor(categoryId, saved.id), { replace: true, state: { created: true } });
      } else if (saved.status === 'DRAFT') {
        setSuccessMessage('Rascunho salvo.');
      } else {
        setSuccessMessage(
          'Rascunho salvo. A versão publicada só muda quando for publicada de novo.',
        );
      }
    });
  }

  const typeLabel = questionTypeLabels[question?.type ?? 'MULTIPLE_CHOICE'];
  const isOtherType = question !== null && question.type !== 'MULTIPLE_CHOICE';
  const isPublished = question !== null && question.status !== 'DRAFT';
  const canShowForm = !isEditing || (question !== null && !isOtherType);
  const actionsDisabledReason = isSaving
    ? 'Aguarde o rascunho terminar de salvar.'
    : hasUnsavedChanges
      ? 'Salve o rascunho antes de publicar, voltar para rascunho ou descartar.'
      : null;

  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full min-w-[720px] max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to={typeof backTo === 'function' ? backTo(categoryId) : backTo}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            ← {backLabel}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-[0.32px]">
                {isEditing ? 'Editar pergunta' : 'Nova pergunta'}: {typeLabel}
              </h1>
              {question && (
                <span className="rounded-full border border-navy/20 bg-white px-3 py-1 text-xs font-medium">
                  {questionStatusLabels[question.status]}
                </span>
              )}
            </div>

            {isEditing && question && (
              <QuestionStatusActions
                questionId={question.id}
                status={question.status}
                categoryId={categoryId}
                questionTitle={question.values.statement}
                disabledReason={actionsDisabledReason}
                onSuccess={(action) => {
                  if (action === 'publish') {
                    setSuccessMessage('Pergunta publicada.');
                  } else if (action === 'unpublish') {
                    setSuccessMessage('Pergunta movida de volta para rascunho.');
                  } else if (action === 'discard') {
                    setFormRevision((revision) => revision + 1);
                    setSuccessMessage('Alterações do rascunho descartadas.');
                  }
                }}
              />
            )}
          </div>
          {!isEditing && <p className="text-sm text-navy/70">A pergunta é salva como rascunho.</p>}
        </header>

        {isLoading && (
          <p role="status" className="text-sm">
            Carregando pergunta...
          </p>
        )}

        {loadErrorMessage && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-[4px] border border-login-error bg-white px-4 py-3 text-sm"
          >
            <span>{loadErrorMessage}</span>
            <button
              type="button"
              onClick={reload}
              className="font-medium underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isOtherType && question && (
          <p
            role="alert"
            className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm"
          >
            Esta pergunta é do tipo {questionTypeLabels[question.type]}, que ainda não pode ser
            editado no painel.
          </p>
        )}

        {isPublished && !isOtherType && (
          <p className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm">
            Esta pergunta está publicada. As alterações ficam no rascunho e só chegam ao app quando
            forem publicadas.
          </p>
        )}

        <div aria-live="polite">
          {successMessage && (
            <p className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm font-medium">
              {successMessage}
            </p>
          )}
        </div>

        {saveErrorMessage && (
          <p
            role="alert"
            className="rounded-[4px] border border-login-error bg-white px-4 py-3 text-sm text-login-error"
          >
            {saveErrorMessage}
          </p>
        )}

        {canShowForm && (
          <MultipleChoiceQuestionForm
            key={`${question?.id ?? 'new'}-${formRevision}`}
            initialValues={question?.values ?? emptyValues}
            submitLabel={isEditing ? 'Salvar rascunho' : 'Criar rascunho'}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onDirtyChange={setHasUnsavedChanges}
          />
        )}
      </section>
    </div>
  );
}

