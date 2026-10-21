/**
 * Criacao e edicao do rascunho de uma pergunta "Preencher lacuna".
 *
 * Sem :questionId na rota, cria (POST) na categoria e segue para a edicao do rascunho criado.
 * Com :questionId, carrega a pergunta pela lista da categoria e salva com PUT. O PUT so altera o
 * rascunho, em qualquer status: numa pergunta publicada, a versao no ar so muda ao publicar.
 * Os caminhos vem por props: features nao importam app/.
 *
 * As rotas de criacao e de edicao renderizam esta mesma page. Por isso o conteudo recebe uma key
 * por pergunta: trocar de rota (criar -> editar, Voltar do navegador, outra pergunta) monta a tela
 * de novo, sem aviso de sucesso, erro ou estado de salvamento da rota anterior.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FillBlankQuestionForm } from '../components/FillBlankQuestionForm';
import { useQuestion } from '../hooks/useQuestion';
import { useSaveFillBlankQuestion } from '../hooks/useSaveFillBlankQuestion';
import { questionStatusLabels, questionTypeLabels } from '../model/questionLabels';
import type { FillBlankFormValues } from '../types';

type FillBlankQuestionPageProps = {
  /** Tela da Trilha de estudos, destino do link de voltar. */
  backTo: string;
  /** Caminho de edicao de uma pergunta, usado depois de criar. */
  editPathFor: (categoryId: string, questionId: string) => string;
};

type LocationState = { created?: boolean } | null;

const emptyValues: FillBlankFormValues = { title: '', statement: '', answers: [], explanation: '' };

export function FillBlankQuestionPage(props: FillBlankQuestionPageProps) {
  const { categoryId = '', questionId } = useParams();
  return (
    <FillBlankQuestionScreen
      key={`${categoryId}/${questionId ?? 'new'}`}
      categoryId={categoryId}
      questionId={questionId}
      {...props}
    />
  );
}

type FillBlankQuestionScreenProps = FillBlankQuestionPageProps & {
  categoryId: string;
  questionId: string | undefined;
};

function FillBlankQuestionScreen({
  backTo,
  editPathFor,
  categoryId,
  questionId,
}: FillBlankQuestionScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = Boolean(questionId);

  const {
    question,
    isLoading,
    errorMessage: loadErrorMessage,
    reload,
  } = useQuestion(categoryId, questionId);
  const {
    save,
    isSaving,
    errorMessage: saveErrorMessage,
  } = useSaveFillBlankQuestion({ categoryId, questionId });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // O aviso de criacao vem no state da navegacao. Depois de exibido, o state e limpo para o
  // aviso nao repetir ao recarregar.
  useEffect(() => {
    if ((location.state as LocationState)?.created) {
      setSuccessMessage('Pergunta criada como rascunho.');
      navigate('.', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  function handleSubmit(values: FillBlankFormValues) {
    setSuccessMessage(null);
    save(values, (saved) => {
      if (!isEditing) {
        // replace: o Voltar do navegador nao reabre a criacao (evita criar a pergunta de novo).
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

  const typeLabel = questionTypeLabels.FILL_BLANK;
  const isOtherType = question !== null && question.type !== 'FILL_BLANK';
  const isPublished = question !== null && question.status !== 'DRAFT';
  const canShowForm = !isEditing || (question !== null && !isOtherType);

  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full min-w-[720px] max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to={backTo}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            ← Trilha de estudos
          </Link>
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
          <FillBlankQuestionForm
            key={question?.id ?? 'new'}
            initialValues={question?.values ?? emptyValues}
            submitLabel={isEditing ? 'Salvar rascunho' : 'Criar rascunho'}
            isSaving={isSaving}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </div>
  );
}
