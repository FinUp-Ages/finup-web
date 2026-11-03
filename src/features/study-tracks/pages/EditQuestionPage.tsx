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

type EditQuestionPageProps = {
  backTo: string | ((categoryId: string) => string);
  backLabel?: string;
  editPathFor: (categoryId: string, questionId: string) => string;
};

/**
 * Rota despachante de edição de perguntas da trilha.
 * Consulta o tipo da pergunta na lista da categoria e direciona para o formulário correspondente:
 * - FILL_BLANK: FillBlankQuestionPage
 * - LEARNING: LearningQuestionPage
 * - Demais tipos: mensagem informativa de formulário ainda indisponível.
 */
export function EditQuestionPage({
  backTo,
  backLabel = 'Perguntas da categoria',
  editPathFor,
}: EditQuestionPageProps) {
  const { categoryId = '', questionId = '' } = useParams();

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
  const isPending = query.isPending;
  const isError = query.isError && question === undefined;
  const notFound = query.isSuccess && question === null;

  if (isPending) {
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

  if (isError || notFound) {
    const errorMsg = notFound ? questionNotFoundMessage : toLoadQuestionErrorMessage(query.error);
    const backUrl = typeof backTo === 'function' ? backTo(categoryId) : backTo;
    return (
      <div className="text-navy">
        <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          <Link
            to={backUrl}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
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

  if (question?.draft.type === 'LEARNING') {
    return (
      <LearningQuestionPage
        backTo={backTo}
        backLabel={backLabel}
        editPathFor={editPathFor}
      />
    );
  }

  if (question?.draft.type === 'FILL_BLANK') {
    return (
      <FillBlankQuestionPage
        backTo={backTo}
        backLabel={backLabel}
        editPathFor={editPathFor}
      />
    );
  }

  const typeLabel = questionTypeLabels[question?.draft.type ?? 'MULTIPLE_CHOICE'];
  const backUrl = typeof backTo === 'function' ? backTo(categoryId) : backTo;
  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to={backUrl}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy"
          >
            ← {backLabel}
          </Link>
          <h1 className="text-2xl font-semibold tracking-[0.32px]">
            Editar pergunta: {typeLabel}
          </h1>
        </header>
        <p
          role="alert"
          className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm"
        >
          Esta pergunta é do tipo {typeLabel}, que ainda não pode ser editado no painel.
        </p>
      </section>
    </div>
  );
}
