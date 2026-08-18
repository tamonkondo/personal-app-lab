/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API のルート URL (例: http://localhost:3000/api)。未設定時は /api にフォールバック */
  readonly VITE_API_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
