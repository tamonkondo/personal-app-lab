import type { TrainingLogDetailResponse } from "@repo/types/notion-training-app";
import { TRAINING_API_BASE, fetcher } from "../../../lib/fetch";
import useSWR from "swr";

export function useTrainingLogDetail(trainingId?: string) {
  const { data, error, isLoading, mutate } =
    useSWR<TrainingLogDetailResponse>(
      trainingId ? `${TRAINING_API_BASE}/training-logs/${trainingId}` : null,
      fetcher,
    );

  return {
    error,
    isLoading,
    mutate,
    trainingLogDetail: data?.data ?? null,
  };
}
