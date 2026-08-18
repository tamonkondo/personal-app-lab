import useSWR from "swr";
import type {
  ExerciseTrendPeriod,
  ExerciseTrendsResponse,
} from "@repo/types/notion-training-app";
import { TRAINING_API_BASE, buildQuery, fetcher } from "../../../lib/fetch";

/** 種目の重量トレンド (期間指定つき時系列) */
export function useExerciseTrends(
  exerciseId: string | undefined,
  period: ExerciseTrendPeriod,
) {
  const { data, error, isLoading, mutate } = useSWR<ExerciseTrendsResponse>(
    exerciseId
      ? `${TRAINING_API_BASE}/exercise/${exerciseId}/trends${buildQuery({ period })}`
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    trends: data?.data ?? null,
    error,
    isLoading,
    mutate,
  };
}
