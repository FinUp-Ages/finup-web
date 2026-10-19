/**
 * API publica da feature "auth".
 * Rotas e outras features importam somente daqui (@/features/auth),
 * nunca de arquivos internos (components/, pages/).
 */
export { AuthProvider } from './components/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { LoginPage } from './pages/LoginPage';
