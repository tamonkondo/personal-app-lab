import type { ExerciseDetail } from "@repo/types/notion-training-app";
import type { ApiResponse } from "@repo/types";
import { TRAINING_API_BASE, fetcher } from "../../../lib/fetch";
import useSWR from "swr";

export function useExerciseDetail(exerciseId?: string) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<ExerciseDetail | null>
  >(exerciseId ? `${TRAINING_API_BASE}/exercise/${exerciseId}` : null, fetcher);

  return {
    exerciseDetail: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
}
