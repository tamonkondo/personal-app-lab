import type { TrainingLogDetailResponse } from "@repo/types/notion-training-app";
import { API_BASE, fetcher } from "../../../lib/fetch";
import useSWR from "swr";

export function useTrainingLogDetail(trainingId?: string) {
  const { data, error, isLoading, mutate } =
    useSWR<TrainingLogDetailResponse>(
      trainingId ? `${API_BASE}/training-logs/${trainingId}` : null,
      fetcher,
    );

  return {
    error,
    isLoading,
    mutate,
    trainingLogDetail: data?.data ?? null,
  };
}
