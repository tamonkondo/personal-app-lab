/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API のルート URL (例: http://localhost:3000/api) */
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
