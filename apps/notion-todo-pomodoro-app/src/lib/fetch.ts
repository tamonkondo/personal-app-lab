export const API_BASE = import.meta.env.VITE_API_URL as string;

export type FetchError = Error & { status?: number };

/** SWR 用の GET fetcher */
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: FetchError = new Error("データ取得に失敗しました");
    error.status = res.status;
    throw error;
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
    const error: FetchError = new Error("更新に失敗しました");
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export default fetcher;
