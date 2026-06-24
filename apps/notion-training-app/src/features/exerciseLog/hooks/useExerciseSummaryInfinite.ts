import { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import { useCallback, useEffect } from "react";
import { ExerciseSummaryParams } from "./useExerciseSummaryParams";
import { formatDate } from "@repo/utils";
import fetcher from "../../../lib/fetch";
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
      // Body parts are joined as CSV in the query string
      const bodyPartsQuery =
        elBodyParts.length > 0 ? elBodyParts.join(",") : "";
      if (pageIndex === 0)
        return `${import.meta.env.VITE_API_URL}/exercise/summary/?limit=5&startDate=${elStartDate ? formatDate(new Date(elStartDate), "hyphen") : ""}&endDate=${elEndDate ? formatDate(new Date(elEndDate), "hyphen") : ""}&sort=${elSort || ""}&parts=${bodyPartsQuery}`; // first page
      if (!previousPageData?.meta.next_cursor) return null;
      return `${import.meta.env.VITE_API_URL}/exercise/summary/?cursor=${previousPageData?.meta.next_cursor}&limit=5&startDate=${elStartDate ? formatDate(new Date(elStartDate), "hyphen") : ""}&endDate=${elEndDate ? formatDate(new Date(elEndDate), "hyphen") : ""}&sort=${elSort || ""}&parts=${bodyPartsQuery}`; // SWR key
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
