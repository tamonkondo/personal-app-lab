import { SortOrder } from "@repo/types";
import { useSearchParams } from "react-router-dom";

export interface TrainingLogParams {
  tlStartDate: string | null;
  tlEndDate: string | null;
  tlSort: SortOrder | null;
  tlPage: number;
  tlParts: string | null;
}

export interface UseTrainingLogParams extends TrainingLogParams {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<
      Record<keyof TrainingLogParams, string | SortOrder | null>
    >,
  ) => void;
}

export function useTrainingLogParams(): UseTrainingLogParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const tlStartDate = searchParams.get("tlStartDate");
  const tlEndDate = searchParams.get("tlEndDate");
  const tlSort: SortOrder | null = searchParams.get(
    "tlSort",
  ) as SortOrder | null;
  const tlParts = searchParams.get("tlParts");
  const tlPage = Number(searchParams.get("tlPage") || 1);

  function setSearchParamsWithReset(
    newParams: Partial<
      Record<keyof TrainingLogParams, string | SortOrder | null>
    >,
  ) {
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
    tlStartDate,
    tlEndDate,
    tlSort,
    tlPage,
    tlParts,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
