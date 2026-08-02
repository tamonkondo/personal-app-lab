import type { ApiResponse, PaginatedResponse } from "../index";
import { ExerciseDisplayBase } from "./exercise";
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
  memo: string;
  bodyWeight: number;
  totalExerciseCount: number;
  totalSetsCount: number;
  totalTrainingVolumeWeight: number;
  exercises: (ExerciseDisplayBase & {
    /** 種目ログのメモ (編集フォームのプリフィル用) */
    memo: string;
    exerciseSets: ExerciseLogWithSetsItemResponse;
  })[];
};

export type TrainingLogDetailResponse = ApiResponse<TrainingLogDetail | null>;

/** トレーニング記録 作成結果 */
export type CreateTrainingLogResult = {
  id: string;
  url: string;
  exerciseLogIds: string[];
};

export type CreateTrainingLogResponse = ApiResponse<CreateTrainingLogResult>;

/** トレーニング記録 更新結果 */
export type UpdateTrainingLogResult = {
  id: string;
  url: string;
  exerciseLogIds: string[];
};

export type UpdateTrainingLogResponse = ApiResponse<UpdateTrainingLogResult>;

/** トレーニング記録 削除結果 */
export type DeleteTrainingLogResult = {
  id: string;
};

export type DeleteTrainingLogResponse = ApiResponse<DeleteTrainingLogResult>;
