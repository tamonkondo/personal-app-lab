import type { ExerciseDetail } from "@repo/types/notion-training-app";
import fetcher from "../../../lib/fetch";
import useSWR from "swr";

type ExerciseDetailResponse = {
  message: string;
  data: ExerciseDetail | null;
};

export function useExerciseDetail(exerciseId?: string) {
  const { data, error, isLoading, mutate } = useSWR<ExerciseDetailResponse>(
    exerciseId
      ? `${import.meta.env.VITE_API_URL}/exercise/${exerciseId}`
      : null,
    fetcher,
  );

  return {
    exerciseDetail: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
}
