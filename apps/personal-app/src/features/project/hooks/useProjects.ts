import useSWR from "swr";
import { fetcher, TODO_API_BASE } from "../../../lib/fetch";
import type { ProjectListResponse } from "@repo/types/notion-todo-pomodoro-app";

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<ProjectListResponse>(
    `${TODO_API_BASE}/projects?limit=100`,
    fetcher,
  );

  return {
    projects: data?.data ?? [],
    error,
    isLoading,
    mutate,
  };
}
