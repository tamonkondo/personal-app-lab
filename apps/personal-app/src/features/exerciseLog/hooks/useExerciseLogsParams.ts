import { useSearchParams } from "react-router-dom";
import { createSetSearchParamsWithReset } from "../../../lib/searchParams";

export type ExerciseLogsParams = {
  exerciseLogsPage: number;
};

export type UseExerciseLogsParams = ExerciseLogsParams & {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<Record<keyof ExerciseLogsParams, string | null>>,
  ) => void;
};

export function useExerciseLogsParams(): UseExerciseLogsParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const exerciseLogsPage = Number(searchParams.get("exerciseLogsPage") || 1);
  const setSearchParamsWithReset =
    createSetSearchParamsWithReset(setSearchParams);

  return {
    exerciseLogsPage,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
