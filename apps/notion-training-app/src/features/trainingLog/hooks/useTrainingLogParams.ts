import { useSearchParams } from "react-router-dom";

export interface TrainingLogParams {
  tlStartDate: string | null;
  tlEndDate: string | null;
  tlSort: string | null;
  tlPage: number;
}

export interface UseTrainingLogParams extends TrainingLogParams {
  setSearchParams: (params: URLSearchParams) => void;
  setSearchParamsWithReset: (
    newParams: Partial<Record<keyof TrainingLogParams, string | null>>,
  ) => void;
}

export function useTrainingLogParams(): UseTrainingLogParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const tlStartDate = searchParams.get("tlStartDate");
  const tlEndDate = searchParams.get("tlEndDate");
  const tlSort = searchParams.get("tlSort");
  const tlPage = Number(searchParams.get("tlPage") || 1);

  function setSearchParamsWithReset(
    newParams: Partial<Record<keyof TrainingLogParams, string | null>>,
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
    tlStartDate,
    tlEndDate,
    tlSort,
    tlPage,
    setSearchParams,
    setSearchParamsWithReset,
  };
}
