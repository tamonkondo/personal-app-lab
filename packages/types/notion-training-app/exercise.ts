import type { PaginatedResponse } from "../index";
import type { ExerciseLogWithSetsItemResponse } from "./exerciseLog";

export type ExerciseSummaryItemResponse = {
  id: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  trainingName: string;
  isPr: boolean;
  musclesTypes: string[];
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
};

export type ExerciseSummaryResponse =
  PaginatedResponse<ExerciseSummaryItemResponse>;
