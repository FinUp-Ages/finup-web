import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CreateQuestionActions } from '../components/CreateQuestionActions';
import { QuestionsTable } from '../components/QuestionsTable';
import { useCategories } from '../hooks/useCategories';
import { useCategoryQuestions } from '../hooks/useCategoryQuestions';
import type { QuestionType } from '../types';

type CategoryQuestionsPageProps = {
  backTo: string;
  createPathFor: (categoryId: string, type: QuestionType) => string;
  editPathFor: (categoryId: string, questionId: string) => string;
};

export function CategoryQuestionsPage({
  backTo,
  createPathFor,
  editPathFor,
}: CategoryQuestionsPageProps) {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const category = categories.find((item) => item.id === categoryId);
  const { questions, hasData, isLoading, isFetching, errorMessage, reload } =
    useCategoryQuestions(categoryId);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <div className="text-navy">
      <section className="mx-auto flex w-full min-w-0 max-w-[1171px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <Link
            to={backTo}
            className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            ← Categorias da trilha
          </Link>
          <h1 className="text-2xl font-semibold tracking-[0.32px]">Perguntas da categoria</h1>
          {category && <p className="break-words text-sm text-navy/60">{category.name}</p>}
        </header>

        {successMessage && (
          <div aria-live="polite">
            <p className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {!isLoading && hasData && (
          <CreateQuestionActions
            key={categoryId}
            onCreate={(type) => navigate(createPathFor(categoryId, type))}
          />
        )}

        {isLoading ? (
          <p
            role="status"
            className="flex min-h-56 items-center justify-center rounded-[4px] border border-black/5 text-sm text-navy/60"
          >
            Carregando perguntas…
          </p>
        ) : (
          <>
            {errorMessage && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <p>
                  {hasData ? `Não foi possível atualizar a lista. ${errorMessage}` : errorMessage}
                </p>
                <button
                  type="button"
                  onClick={reload}
                  disabled={isFetching}
                  className="rounded-[4px] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-70"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {isFetching && (
              <p role="status" className="text-sm text-navy/60">
                Atualizando perguntas…
              </p>
            )}
            {hasData &&
              (questions.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-[4px] border border-black/5 px-4 text-center text-sm text-navy/60">
                  <p className="font-semibold text-navy">
                    Nenhuma pergunta cadastrada nesta categoria.
                  </p>
                  <p>Escolha um tipo e crie a primeira pergunta.</p>
                </div>
              ) : (
                <QuestionsTable
                  questions={questions}
                  categoryId={categoryId}
                  editPathFor={(questionId) => editPathFor(categoryId, questionId)}
                  isFetching={isFetching}
                  onActionSuccess={(action) => {
                    if (action === 'publish') {
                      setSuccessMessage('Pergunta publicada.');
                    } else if (action === 'unpublish') {
                      setSuccessMessage('Pergunta movida de volta para rascunho.');
                    } else if (action === 'discard') {
                      setSuccessMessage('Alterações do rascunho descartadas.');
                    }
                  }}
                />
              ))}
          </>
        )}
      </section>
    </div>
  );
}
