/**
 * API publica da feature "study-tracks" (Trilha de estudos).
 * Rotas e outras features importam somente daqui (@/features/study-tracks).
 */
export { FillBlankQuestionPage } from './pages/FillBlankQuestionPage';
export { StudyCategoriesPage } from './pages/StudyCategoriesPage';
export type { CategoryDTO, QuestionStatus, QuestionType } from './types';
export { QuestionStatusActions } from './components/QuestionStatusActions';
export { QuestionActionDialog } from './components/QuestionActionDialog';
export { useQuestionActions } from './hooks/useQuestionActions';
