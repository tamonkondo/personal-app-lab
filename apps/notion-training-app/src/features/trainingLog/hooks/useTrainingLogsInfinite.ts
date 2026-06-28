import { TrainingLogSummaryResponse } from "@repo/types/notion-training-app";
import { useCallback, useEffect } from "react";
import { TrainingLogParams } from "./useTrainingLogParams";
import { formatDate } from "@repo/utils";
import fetcher from "../../../lib/fetch";
import useSWRInfinite from "swr/infinite";
interface UseTrainingLogInfinite {
  params: TrainingLogParams;
}

export function useTrainingLogInfinite({ params }: UseTrainingLogInfinite) {
  const { tlStartDate, tlEndDate, tlSort, tlPage, tlParts } = params;
  const getKey = useCallback(
    (
      pageIndex: number,
      previousPageData: TrainingLogSummaryResponse | null,
    ) => {
      if (previousPageData && !previousPageData.data.length) return null;
      if (pageIndex === 0)
        return `${import.meta.env.VITE_API_URL}/training-logs/?limit=5&startDate=${tlStartDate ? formatDate(new Date(tlStartDate), "hyphen") : ""}&endDate=${tlEndDate ? formatDate(new Date(tlEndDate), "hyphen") : ""}&sort=${tlSort || ""}&parts=${tlParts || ""}`; // first page
      if (!previousPageData?.meta.next_cursor) return null;
      return `${import.meta.env.VITE_API_URL}/training-logs/?cursor=${previousPageData?.meta.next_cursor}&limit=5&startDate=${tlStartDate ? formatDate(new Date(tlStartDate), "hyphen") : ""}&endDate=${tlEndDate ? formatDate(new Date(tlEndDate), "hyphen") : ""}&sort=${tlSort || ""}&parts=${tlParts || ""}`; // SWR key
    },
    [tlStartDate, tlEndDate, tlSort, tlParts],
  );
  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<TrainingLogSummaryResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });
  useEffect(() => {
    const target = Math.max(1, Number(tlPage) || 1);
    if (size < target) setSize(target);
  }, [tlPage, size, setSize]);
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
