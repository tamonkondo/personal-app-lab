import type { PaginatedResponse } from "../index";
import type { ExerciseLogWithSetsItemResponse } from "./exerciseLog";

export type ExerciseBase = {
  id: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  trainingName: string;
  isPr: boolean;
  musclesTypes: string[];
};

export type ExerciseSummaryItemResponse = ExerciseBase & {
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
};

export type ExerciseSummaryResponse =
  PaginatedResponse<ExerciseSummaryItemResponse>;
