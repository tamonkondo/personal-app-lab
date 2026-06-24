import type { SetURLSearchParams } from "react-router-dom";

type SearchParamValue = string | null | undefined;

export function applySearchParamsWithReset(
  prevParams: URLSearchParams,
  params: Record<string, SearchParamValue>,
) {
  const updatedParams = new URLSearchParams(prevParams);

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") {
      updatedParams.delete(key);
      return;
    }

    updatedParams.set(key, value);
  });

  return updatedParams;
}

export function createSetSearchParamsWithReset(
  setSearchParams: SetURLSearchParams,
) {
  return (params: Record<string, SearchParamValue>) =>
    setSearchParams((prevParams) =>
      applySearchParamsWithReset(prevParams, params),
    );
}

