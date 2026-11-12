import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategoryQuestions } from '../api/getCategoryQuestions';
import { questionQueryKeys } from '../hooks/questionQueryKeys';
import {
  questionNotFoundMessage,
  toLoadQuestionErrorMessage,
} from '../model/questionErrorMessages';
import { questionTypeLabels } from '../model/questionLabels';
import type { QuestionDTO } from '../types';
import { FillBlankQuestionPage } from './FillBlankQuestionPage';
import { LearningQuestionPage } from './LearningQuestionPage';
import { MultipleChoiceQuestionPage } from './MultipleChoiceQuestionPage';

type EditQuestionPageProps = {
  backTo: string | ((categoryId: string) => string);
  backLabel?: string;
  editPathFor: (categoryId: string, questionId: string) => string;
};

/**
 * Rota despachante de edicao de perguntas da trilha.
 * Consulta o tipo da pergunta na lista da categoria e direciona para o formulario correspondente
 * (FILL_BLANK, MULTIPLE_CHOICE ou LEARNING). Um tipo desconhecido mostra um aviso.
 */
export function EditQuestionPage({
  backTo,
  backLabel = 'Perguntas da categoria',
  editPathFor,
}: EditQuestionPageProps) {
  const { categoryId = '', questionId = '' } = useParams();
  const backUrl = typeof backTo === 'function' ? backTo(categoryId) : backTo;

  const selectQuestion = useCallback(
    (questions: QuestionDTO[]) => questions.find((q) => q.id === questionId) ?? null,
    [questionId],
  );

  const query = useQuery({
    queryKey: questionQueryKeys.categoryQuestions(categoryId),
    queryFn: () => getCategoryQuestions(categoryId),
    enabled: Boolean(categoryId && questionId),
    select: selectQuestion,
  });

  const question = query.data;
  const isError = query.isError && question === undefined;

  if (query.isPending) {
    return (
      <div className="text-navy">
        <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          <p role="status" className="text-sm">
            Carregando pergunta...
          </p>
        </section>
      </div>
    );
  }

  if (isError || !question) {
    const errorMsg = isError ? toLoadQuestionErrorMessage(query.error) : questionNotFoundMessage;
    return (
      <div className="text-navy">
        <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          <Link
            to={backUrl}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            ← {backLabel}
          </Link>
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-[4px] border border-login-error bg-white px-4 py-3 text-sm"
          >
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="font-medium underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
            >
              Tentar novamente
            </button>
          </div>
        </section>
      </div>
    );
  }

  const pageProps = { backTo, backLabel, editPathFor };
  switch (question.draft.type) {
    case 'FILL_BLANK':
      return <FillBlankQuestionPage {...pageProps} />;
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceQuestionPage {...pageProps} />;
    case 'LEARNING':
      return <LearningQuestionPage {...pageProps} />;
  }

  // Tipo que o painel ainda nao conhece (ex.: um tipo novo no backend).
  const unknownType = (question.draft as { type: string }).type;
  const typeLabel =
    questionTypeLabels[unknownType as keyof typeof questionTypeLabels] ?? unknownType;
  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to={backUrl}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            ← {backLabel}
          </Link>
          <h1 className="text-2xl font-semibold tracking-[0.32px]">Editar pergunta: {typeLabel}</h1>
        </header>
        <p role="alert" className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm">
          Esta pergunta é do tipo {typeLabel}, que ainda não pode ser editado no painel.
        </p>
      </section>
    </div>
  );
}
