import type { ExerciseLogWithSetsResponse } from "@repo/types/notion-training-app";
import { useCallback, useEffect } from "react";
import fetcher from "../../../lib/fetch";
import useSWRInfinite from "swr/infinite";

type UseExerciseLogsInfinite = {
  exerciseId?: string;
  page: number;
  limit?: number;
};

export function useExerciseLogsInfinite({
  exerciseId,
  page,
  limit = 7,
}: UseExerciseLogsInfinite) {
  const getKey = useCallback(
    (
      pageIndex: number,
      previousPageData: ExerciseLogWithSetsResponse | null,
    ) => {
      if (!exerciseId) return null;
      if (previousPageData && !previousPageData.data.length) return null;

      const baseUrl = `${import.meta.env.VITE_API_URL}/exercise/${exerciseId}/logs`;
      if (pageIndex === 0) return `${baseUrl}?limit=${limit}`;
      if (!previousPageData?.meta.next_cursor) return null;

      return `${baseUrl}?cursor=${previousPageData.meta.next_cursor}&limit=${limit}`;
    },
    [exerciseId, limit],
  );

  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<ExerciseLogWithSetsResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });

  useEffect(() => {
    const target = Math.max(1, Number(page) || 1);
    if (size < target) setSize(target);
  }, [page, setSize, size]);

  const exerciseLogs = data?.flatMap((pageData) => pageData.data) ?? [];
  const lastPage = data?.[data.length - 1];

  return {
    data,
    error,
    exerciseLogs,
    hasMore: Boolean(lastPage?.meta.has_more),
    isLoading,
    isValidating,
    mutate,
    setSize,
    size,
  };
}
