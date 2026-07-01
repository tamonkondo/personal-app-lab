import type { TrainingLogDetailResponse } from "@repo/types/notion-training-app";
import fetcher from "../../../lib/fetch";
import useSWR from "swr";

export function useTrainingLogDetail(trainingId?: string) {
  const { data, error, isLoading, mutate } =
    useSWR<TrainingLogDetailResponse>(
      trainingId
        ? `${import.meta.env.VITE_API_URL}/training-logs/${trainingId}`
        : null,
      fetcher,
    );

  return {
    error,
    isLoading,
    mutate,
    trainingLogDetail: data?.data ?? null,
  };
}
