// API アクセスの実装は @repo/api-client に集約 (アプリ間のコピペ実装を解消)
export { fetcher, mutateJson, buildQuery, ApiError } from "@repo/api-client";
export type { QueryParams } from "@repo/api-client";

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error("VITE_API_URL が設定されていません (.env を確認してください)");
}

/** API のベース URL。各フックで import.meta.env を直接参照しない */
export const API_BASE: string = apiUrl;
