import { useSearchParams } from "react-router-dom";
import { createSetSearchParamsWithReset } from "../../../lib/searchParams";
import BODY_PARTS from "../../../constants/parts";

export type ExerciseSummaryParams = {
  elStartDate: string | null;
  elEndDate: string | null;
  elSort: string | null;
  elPage: number;
  elBodyParts: (typeof BODY_PARTS)[number]["value"][];
};

export type UseExerciseSummaryParams = ExerciseSummaryParams & {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<Record<keyof ExerciseSummaryParams, string | null>>,
  ) => void;
};

export function useExerciseSummaryParams(): UseExerciseSummaryParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const elStartDate = searchParams.get("elStartDate");
  const elEndDate = searchParams.get("elEndDate");
  const elSort = searchParams.get("elSort");
  const elPage = Number(searchParams.get("elPage") || 1);
  const elBodyParts = searchParams.getAll(
    "elBodyParts",
  ) as (typeof BODY_PARTS)[number]["value"][];
  const setSearchParamsWithReset =
    createSetSearchParamsWithReset(setSearchParams);

  return {
    elStartDate,
    elEndDate,
    elSort,
    elPage,
    elBodyParts,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
