import type { ApiResponse, PaginatedResponse } from "../index";
import { ExerciseBase } from "./exercise";
import { ExerciseLogWithSetsItemResponse } from "./exerciseLog";

export type TrainingLogExerciseItem = {
  name: string;
  todayMaxWeight: number;
  rest: number;
  memo: string;
  sets: number;
};

export type TrainingLogSummaryItem = {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exercises: TrainingLogExerciseItem[];
};

export type TrainingLogSummaryResponse =
  PaginatedResponse<TrainingLogSummaryItem>;

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

export type TrainingLogDetail = {
  id: string;
  createdTime: string;
  bodyParts: string[];
  bodyWeight: number;
  totalExerciseCount: number;
  totalSetsCount: number;
  totalTrainingVolumeWeight: number;
  memo: string;
  exercises: ExerciseBase & {
    sets: ExerciseLogWithSetsItemResponse;
  };
};

export type TrainingLogDetailResponse = ApiResponse<TrainingLogDetail | null>;
