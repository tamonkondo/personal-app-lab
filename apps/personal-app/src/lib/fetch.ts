// API アクセスの実装は @repo/api-client に集約 (アプリ間のコピペ実装を解消)
export { fetcher, mutateJson, buildQuery, ApiError } from "@repo/api-client";
export type { QueryParams } from "@repo/api-client";

/**
 * API のルート。各フックで import.meta.env を直接参照しない。
 * 未設定時は同一オリジンの /api にフォールバックする
 * (本番の nginx は /api/ を api コンテナへプロキシしており、
 *  かつ .dockerignore により .env はイメージに入らないため)
 */
const API_ROOT: string = (import.meta.env.VITE_API_URL ?? "/api").replace(
  /\/+$/,
  "",
);

/** トレーニング記録ドメインの API ベース (apps/api の modules/notion-training-app に対応) */
export const TRAINING_API_BASE = `${API_ROOT}/notion-training-app`;

/** Todo/ポモドーロドメインの API ベース (apps/api の modules/notion-todo-pomodoro-app に対応) */
export const TODO_API_BASE = `${API_ROOT}/notion-todo-pomodoro-app`;
