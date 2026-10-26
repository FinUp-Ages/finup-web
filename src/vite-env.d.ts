/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_WIDGETS_API?: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_COGNITO_REGION?: string;
  readonly VITE_COGNITO_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
