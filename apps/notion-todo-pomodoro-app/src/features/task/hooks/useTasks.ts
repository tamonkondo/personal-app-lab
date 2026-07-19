import useSWR from "swr";
import { fetcher, API_BASE } from "../../../lib/fetch";
import type { TaskListResponse } from "@repo/types/notion-todo-pomodoro-app";
import type { TaskListParams } from "@repo/schemas/notion-todo-pomodoro-app";

/** タスク一覧取得のキー(URL)を組み立てる。mutate の matcher でも使う。 */
export const TASKS_KEY_PREFIX = `${API_BASE}/tasks`;

export function buildTasksKey(
  params: Partial<TaskListParams> & { limit?: number },
): string {
  const q = new URLSearchParams();
  if (params.scope) q.set("scope", params.scope);
  if (params.status) q.set("status", params.status);
  if (params.category) q.set("category", params.category);
  if (params.projectId) q.set("projectId", params.projectId);
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return qs ? `${TASKS_KEY_PREFIX}?${qs}` : TASKS_KEY_PREFIX;
}

export function useTasks(
  params: Partial<TaskListParams> & { limit?: number },
) {
  const key = buildTasksKey(params);
  const { data, error, isLoading, mutate } = useSWR<TaskListResponse>(
    key,
    fetcher,
  );

  return {
    tasks: data?.data ?? [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}
