import { useId, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from './Dialog';
import { SecondaryButton } from './SecondaryButton';
import { questionTypeLabels } from '../model/questionLabels';
import type { QuestionType } from '../types';

type CreateQuestionActionsProps = {
  onCreate: (type: QuestionType) => void;
};

export function CreateQuestionActions({ onCreate }: CreateQuestionActionsProps) {
  const selectId = useId();
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<QuestionType>('FILL_BLANK');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOpen(false);
    onCreate(type);
  }

  return (
    <>
      <div className="w-[220px]">
        <Button type="button" onClick={() => setIsOpen(true)} className="whitespace-nowrap px-6">
          <Plus aria-hidden="true" size={20} />
          Nova pergunta
        </Button>
      </div>

      {isOpen && (
        <Dialog titleId={titleId} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <h2 id={titleId} className="text-xl font-semibold">
              Nova pergunta
            </h2>

            <div className="flex flex-col gap-2">
              <label htmlFor={selectId} className="text-sm font-semibold">
                Tipo de pergunta
              </label>
              <select
                id={selectId}
                autoFocus
                value={type}
                onChange={(event) => setType(event.target.value as QuestionType)}
                className="h-[55px] rounded-[6px] border border-black/10 bg-white px-4 text-base text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                <option value="FILL_BLANK">{questionTypeLabels.FILL_BLANK}</option>
                <option value="MULTIPLE_CHOICE">{questionTypeLabels.MULTIPLE_CHOICE}</option>
                <option value="LEARNING">{questionTypeLabels.LEARNING}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SecondaryButton type="button" onClick={() => setIsOpen(false)}>
                Cancelar
              </SecondaryButton>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
