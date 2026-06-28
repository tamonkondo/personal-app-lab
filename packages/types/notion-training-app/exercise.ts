import type { PaginatedResponse } from "../index";
import type { ExerciseLogWithSetsItemResponse } from "./exerciseLog";

export type ExerciseDisplayBase = {
  id: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  trainingName: string;
  isPr: boolean;
  musclesTypes: string[];
};

export type ExerciseSummaryItem = ExerciseDisplayBase & {
  exerciseUrl: string;
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
};

export type ExerciseSummaryResponse = PaginatedResponse<ExerciseSummaryItem>;

export type ExerciseDetail = {
  id: string;
  exerciseName: string;
  latestTrainingDate: string;
  musclesTypes: string[];
  trainingName: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  totalSetsCount: number;
  totalTrainingDays: number;
  totalTrainingVolumeWeight: number;
};

export type ExerciseTrendPeriod = "1w" | "2w" | "4w" | "6m" | "1y" | "all";
