import { Link } from 'react-router-dom';
import { questionStatusLabels, questionTypeLabels } from '../model/questionLabels';
import { questionTitle } from '../model/questionTitle';
import type { QuestionDTO } from '../types';
import { QuestionStatusActions } from './QuestionStatusActions';
import type { QuestionActionKind } from './QuestionActionDialog';

type QuestionsTableProps = {
  questions: QuestionDTO[];
  categoryId?: string;
  editPathFor: (questionId: string) => string;
  isFetching: boolean;
  onActionSuccess?: (action: QuestionActionKind, updated: QuestionDTO) => void;
};

export function QuestionsTable({
  questions,
  categoryId,
  editPathFor,
  isFetching,
  onActionSuccess,
}: QuestionsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[4px] border border-black/5 bg-white">
      <table
        aria-busy={isFetching}
        className="w-full min-w-[720px] table-fixed border-collapse text-left text-base tracking-[0.32px] text-navy"
      >
        <caption className="sr-only">Perguntas da categoria</caption>
        <colgroup>
          <col />
          <col className="w-[180px]" />
          <col className="w-[200px]" />
          <col className="w-[360px]" />
        </colgroup>
        <thead>
          <tr className="h-[57px] border-b border-black/5">
            <th scope="col" className="px-4 font-normal">
              TÍTULO
            </th>
            <th scope="col" className="px-4 font-normal">
              TIPO
            </th>
            <th scope="col" className="px-4 font-normal">
              STATUS
            </th>
            <th scope="col" className="px-4 font-normal">
              AÇÕES
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => {
            const title = questionTitle(question.draft);
            return (
              <tr key={question.id} className="h-[75px] border-b border-black/5 last:border-b-0">
                <th scope="row" className="truncate px-4 font-semibold" title={title}>
                  {title}
                </th>
                <td className="px-4">{questionTypeLabels[question.draft.type]}</td>
                <td className="px-4">
                  <span className="inline-block whitespace-nowrap rounded-full border border-navy/20 bg-white px-3 py-1 text-xs font-medium">
                    {questionStatusLabels[question.status]}
                  </span>
                </td>
                <td className="px-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={editPathFor(question.id)}
                      aria-label={`Editar pergunta ${title}`}
                      className="inline-flex h-[38px] items-center rounded-[4px] border border-black/10 bg-white px-3 text-sm font-medium hover:bg-surface-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      Editar
                    </Link>
                    <QuestionStatusActions
                      questionId={question.id}
                      status={question.status}
                      categoryId={categoryId}
                      questionTitle={title}
                      onSuccess={onActionSuccess}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
