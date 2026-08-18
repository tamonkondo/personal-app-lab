import useSWR from "swr";
import type { ExerciseNamesResponse } from "@repo/types/notion-training-app";
import { TRAINING_API_BASE, fetcher } from "../../../lib/fetch";

/** 種目名一覧 (作成フォームの選択肢用) */
export function useExerciseNames() {
  const { data, error, isLoading } = useSWR<ExerciseNamesResponse>(
    `${TRAINING_API_BASE}/exercise/names`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );

  return {
    exerciseNames: data?.data ?? [],
    error,
    isLoading,
  };
}
