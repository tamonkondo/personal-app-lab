import type { ApiResponse, PaginatedResponse } from "../index";

export type TrainingLogExerciseItemResponse = {
  name: string;
  todayMaxWeight: number;
  rest: number;
  memo: string;
  sets: number;
};

export type TrainingLogSummaryItemResponse = {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exercises: TrainingLogExerciseItemResponse[];
};

export type TrainingLogSummaryResponse =
  PaginatedResponse<TrainingLogSummaryItemResponse>;

export type NewestTrainingLogItemResponse = {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exerciseCount: number;
  totalWeight: number;
};

export type NewestTrainingLogResponse =
  ApiResponse<NewestTrainingLogItemResponse | null>;
