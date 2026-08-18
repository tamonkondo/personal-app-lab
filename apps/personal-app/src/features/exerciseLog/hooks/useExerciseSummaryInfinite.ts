import { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import { useCallback, useEffect } from "react";
import { ExerciseSummaryParams } from "./useExerciseSummaryParams";
import { formatDate } from "@repo/utils";
import { TRAINING_API_BASE, buildQuery, fetcher } from "../../../lib/fetch";
import useSWRInfinite from "swr/infinite";

interface UseExerciseSummaryInfinite {
  params: ExerciseSummaryParams;
  page: number;
}

export function useExerciseSummaryInfinite({
  params,
}: UseExerciseSummaryInfinite) {
  const { elStartDate, elEndDate, elSort, elPage, elBodyParts } = params;
  const getKey = useCallback(
    (pageIndex: number, previousPageData: ExerciseSummaryResponse | null) => {
      if (previousPageData && !previousPageData.data.length) return null;
      if (pageIndex > 0 && !previousPageData?.meta.next_cursor) return null;
      const query = buildQuery({
        cursor: pageIndex > 0 ? previousPageData?.meta.next_cursor : undefined,
        limit: 5,
        startDate: elStartDate
          ? formatDate(new Date(elStartDate), "hyphen")
          : undefined,
        endDate: elEndDate
          ? formatDate(new Date(elEndDate), "hyphen")
          : undefined,
        sort: elSort,
        // Body parts are joined as CSV in the query string
        parts: elBodyParts.length > 0 ? elBodyParts.join(",") : undefined,
      });
      return `${TRAINING_API_BASE}/exercise/summary/${query}`;
    },
    [elStartDate, elEndDate, elSort, elBodyParts],
  );
  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<ExerciseSummaryResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });
  useEffect(() => {
    const target = Math.max(1, Number(elPage) || 1);
    if (size < target) setSize(target);
  }, [elPage, size, setSize]);
  return {
    data,
    error,
    isLoading,
    mutate,
    size,
    setSize,
    isValidating,
  };
}
