import { useSearchParams } from "react-router-dom";
import type { ExerciseTrendPeriod } from "@repo/types/notion-training-app";
export interface ExerciseTrendsParams {
  trendPeriod: ExerciseTrendPeriod | null;
}

export interface UseExerciseTrendsParams extends ExerciseTrendsParams {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<
      Record<keyof ExerciseTrendsParams, ExerciseTrendPeriod | null>
    >,
  ) => void;
}

export function useExerciseTrendsParams(): UseExerciseTrendsParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const trendPeriod: ExerciseTrendPeriod | null = searchParams.get(
    "trendPeriod",
  ) as ExerciseTrendPeriod | null;

  function setSearchParamsWithReset(
    newParams: Partial<
      Record<keyof ExerciseTrendsParams, ExerciseTrendPeriod | null>
    >,
  ) {
    setSearchParams((prevParams) => {
      const updatedParams = new URLSearchParams(prevParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          updatedParams.delete(key);
        } else {
          updatedParams.set(key, value);
        }
      });
      return updatedParams;
    });
  }
  return {
    trendPeriod,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
