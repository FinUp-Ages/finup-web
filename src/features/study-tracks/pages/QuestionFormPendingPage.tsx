import { Link, useParams } from 'react-router-dom';
import { questionTypeLabels } from '../model/questionLabels';
import type { QuestionType } from '../types';

type QuestionFormPendingPageProps = {
  type: Exclude<QuestionType, 'FILL_BLANK'>;
  backPathFor: (categoryId: string) => string;
};

/** Destino temporario das acoes de criacao ate a integracao dos formularios de outras tasks. */
export function QuestionFormPendingPage({ type, backPathFor }: QuestionFormPendingPageProps) {
  const { categoryId = '' } = useParams();

  return (
    <section className="mx-auto flex w-full max-w-[760px] flex-col gap-6 text-navy">
      <Link
        to={backPathFor(categoryId)}
        className="w-fit text-sm underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        ← Perguntas da categoria
      </Link>
      <h1 className="text-2xl font-semibold tracking-[0.32px]">
        Nova pergunta: {questionTypeLabels[type]}
      </h1>
      <p role="status" className="rounded-[4px] border border-navy/20 bg-white px-4 py-3 text-sm">
        O formulário deste tipo ainda não está disponível.
      </p>
    </section>
  );
}
