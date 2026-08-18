import { useSearchParams } from "react-router-dom";
import {
  exerciseDetailParamsSchema,
  type ExerciseDetailParams,
} from "@repo/schemas/notion-training-app";
import { createSetSearchParamsWithReset } from "../../../lib/searchParams";

export interface UseExerciseDetailParams extends ExerciseDetailParams {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<ExerciseDetailParams>,
  ) => void;
}

export function useExerciseDetailParams(): UseExerciseDetailParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trendPeriod, exerciseGuideLineRep } =
    exerciseDetailParamsSchema.parse({
      trendPeriod: searchParams.get("trendPeriod"),
      exerciseGuideLineRep: searchParams.get("exerciseGuideLineRep"),
    });

  // 共有ヘルパーを利用 (以前は同等ロジックをここで再実装していた)
  const setSearchParamsWithReset =
    createSetSearchParamsWithReset(setSearchParams);

  return {
    trendPeriod,
    exerciseGuideLineRep,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
