import { useSearchParams } from "react-router-dom";
import {
  exerciseDetailParamsSchema,
  type ExerciseDetailParams,
} from "@repo/schemas/notion-training-app";

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

  function setSearchParamsWithReset(newParams: Partial<ExerciseDetailParams>) {
    setSearchParams((prevParams) => {
      const updatedParams = new URLSearchParams(prevParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          updatedParams.delete(key);
        } else {
          updatedParams.set(key, String(value));
        }
      });
      return updatedParams;
    });
  }
  return {
    trendPeriod,
    exerciseGuideLineRep,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
