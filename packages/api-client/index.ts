/**
 * @repo/api-client
 * フロントエンド共通の API アクセス層。
 * (以前は各アプリの src/lib/fetch.ts にコピペされ実装が乖離していたものを集約)
 */

/** API エラー。HTTP ステータスとレスポンスボディを保持する */
export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** レスポンスボディの message を優先して ApiError を組み立てる */
async function toApiError(res: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let body: unknown;
  try {
    body = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
    ) {
      message = (body as { message: string }).message;
    }
  } catch {
    // JSON でないボディは無視して fallback メッセージを使う
  }
  return new ApiError(message, res.status, body);
}

/** SWR 用の GET fetcher */
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw await toApiError(res, "データ取得に失敗しました");
  }
  return res.json();
};

/** JSON ボディ付きの書き込み系リクエスト */
export async function mutateJson<T>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw await toApiError(res, "更新に失敗しました");
  }
  return res.json();
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * クエリ文字列を組み立てる。null / undefined / 空文字は送信しない。
 * 返り値は "?limit=5&sort=desc" 形式 (パラメータが無ければ空文字)。
 * 手書きテンプレートリテラル (`?sort=${sort || ""}` 等) の
 * 空パラメータ送信・未エンコード問題を防ぐ。
 */
export function buildQuery(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
