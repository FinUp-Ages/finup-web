import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { questionTypeLabels } from '../model/questionLabels';
import type { QuestionType } from '../types';

type CreateQuestionActionsProps = {
  onCreate: (type: QuestionType) => void;
};

export function CreateQuestionActions({ onCreate }: CreateQuestionActionsProps) {
  const selectId = useId();
  const [type, setType] = useState<QuestionType>('FILL_BLANK');

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={selectId} className="text-sm font-medium">
          Tipo de pergunta
        </label>
        <select
          id={selectId}
          value={type}
          onChange={(event) => setType(event.target.value as QuestionType)}
          className="h-[55px] rounded-[6px] border border-black/10 bg-white px-4 text-base text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <option value="FILL_BLANK">{questionTypeLabels.FILL_BLANK}</option>
          <option value="MULTIPLE_CHOICE">{questionTypeLabels.MULTIPLE_CHOICE}</option>
          <option value="LEARNING">{questionTypeLabels.LEARNING}</option>
        </select>
      </div>
      <div className="w-[220px]">
        <Button type="button" onClick={() => onCreate(type)} className="whitespace-nowrap px-6">
          <Plus aria-hidden="true" size={20} />
          Nova pergunta
        </Button>
      </div>
    </div>
  );
}
