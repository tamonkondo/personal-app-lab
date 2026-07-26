import type { ApiResponse, PaginatedResponse } from "../index";
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

/** 種目名一覧 (作成フォームの選択肢用) */
export type ExerciseNameItem = { id: string; name: string };
export type ExerciseNamesResponse = ApiResponse<ExerciseNameItem[]>;

export type ExerciseDetail = {
  id: string;
  exerciseName: string;
  latestTrainingDate: string;
  musclesTypes: string[];
  rmTypes: ExerciseRmTypes | null;
  trainingName: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  totalSetsCount: number;
  totalTrainingDays: number;
  totalTrainingVolumeWeight: number;
};
export const EXERCISE_RM_TYPES = ["upperBody", "lowerBody"] as const;
export const EXERCISE_TREND_PERIODS = [
  "1w",
  "2w",
  "4w",
  "6m",
  "1y",
  "all",
] as const;

export type ExerciseTrendPeriod = (typeof EXERCISE_TREND_PERIODS)[number];
export type ExerciseRmTypes = (typeof EXERCISE_RM_TYPES)[number];

export const EXERCISE_GUIDE_LINE_REPS = ["5", "10", "15", "20"] as const;

export type ExerciseGuideLineRep = (typeof EXERCISE_GUIDE_LINE_REPS)[number];
