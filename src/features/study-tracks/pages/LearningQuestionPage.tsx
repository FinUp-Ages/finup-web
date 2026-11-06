/**
 * Criação e edição do rascunho de uma pergunta "Conteúdo explicativo / educativo" (LEARNING).
 *
 * Sem :questionId na rota, cria (POST) na categoria e segue para a edição do rascunho criado.
 * Com :questionId, carrega a pergunta pela lista da categoria e salva com PUT. O PUT só altera o
 * rascunho, em qualquer status: numa pergunta publicada, a versão no ar só muda ao publicar.
 * Os caminhos vêm por props: features não importam app/.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LearningQuestionForm } from '../components/LearningQuestionForm';
import { QuestionStatusActions } from '../components/QuestionStatusActions';
import { useLearningQuestion } from '../hooks/useLearningQuestion';
import { useSaveLearningQuestion } from '../hooks/useSaveLearningQuestion';
import { questionStatusLabels, questionTypeLabels } from '../model/questionLabels';
import type { LearningFormValues } from '../types';

type LearningQuestionPageProps = {
  /** Tela da Trilha de estudos, destino do link de voltar. */
  backTo: string | ((categoryId: string) => string);
  backLabel?: string;
  /** Caminho de edição de uma pergunta, usado depois de criar. */
  editPathFor: (categoryId: string, questionId: string) => string;
};

type LocationState = { created?: boolean } | null;

const emptyValues: LearningFormValues = { title: '', body: '' };

export function LearningQuestionPage(props: LearningQuestionPageProps) {
  const { categoryId = '', questionId } = useParams();
  return (
    <LearningQuestionScreen
      key={`${categoryId}/${questionId ?? 'new'}`}
      categoryId={categoryId}
      questionId={questionId}
      {...props}
    />
  );
}

type LearningQuestionScreenProps = LearningQuestionPageProps & {
  categoryId: string;
  questionId: string | undefined;
};

function LearningQuestionScreen({
  backTo,
  backLabel = 'Trilha de estudos',
  editPathFor,
  categoryId,
  questionId,
}: LearningQuestionScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = Boolean(questionId);

  const {
    question,
    isLoading,
    errorMessage: loadErrorMessage,
    reload,
  } = useLearningQuestion(categoryId, questionId);
  const {
    save,
    isSaving,
    errorMessage: saveErrorMessage,
  } = useSaveLearningQuestion({ categoryId, questionId });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formRevision, setFormRevision] = useState(0);

  useEffect(() => {
    if ((location.state as LocationState)?.created) {
      setSuccessMessage('Pergunta criada como rascunho.');
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  function handleSubmit(values: LearningFormValues) {
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

  const typeLabel = questionTypeLabels.LEARNING;
  const isPublished = question !== null && question.status !== 'DRAFT';
  const canShowForm = !isEditing || question !== null;
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
                questionTitle={question.values.title}
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

        {isPublished && (
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
          <LearningQuestionForm
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
