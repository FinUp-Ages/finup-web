/**
 * API publica da feature "study-tracks" (Trilha de estudos).
 * Rotas e outras features importam somente daqui (@/features/study-tracks).
 */
export { FillBlankQuestionPage } from './pages/FillBlankQuestionPage';
export { MultipleChoiceQuestionPage } from './pages/MultipleChoiceQuestionPage';
export { LearningQuestionPage } from './pages/LearningQuestionPage';
export { EditQuestionPage } from './pages/EditQuestionPage';
export { StudyCategoriesPage } from './pages/StudyCategoriesPage';
export { CategoryQuestionsPage } from './pages/CategoryQuestionsPage';
export { QuestionFormPendingPage } from './pages/QuestionFormPendingPage';
export type { CategoryDTO, QuestionStatus, QuestionType, LearningQuestion, LearningFormValues } from './types';
