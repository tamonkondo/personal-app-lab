import { ApiResponse, BaseMeta } from "../index";
/**
 *  共通のAPIを定義する。
 * APIの出入口
 *
 */

// トレーニングの登録
// トレーニングデータの取得
//

// 最新のトレーニングログを取得するAPI

// トレーニングログ
export interface TrainingLogSummary {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exercises: {
    name: string;
    todayMaxWeight: number;
    rest: number;
    memo: string;
    sets: number;
  }[];
}
export type TrainingLogSummaryResponse = BaseMeta & {
  data: TrainingLogSummary[];
};
export type TrainingLogDetailResponse = {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exercises: ExerciseLogWithSets[];
};

export type ExerciseSet = {
  exerciseId: string;
  id: string;
  kg: number;
  rep: number;
  maxWeight: number;
  memo: string;
  notionUrl: string;
};

export type ExerciseLogWithSets = {
  exerciseId: string;
  createdTime: string;
  rest: number;
  trainingName: string;
  sets: ExerciseSet[];
  notionUrl: string;
};

export type ExerciseSummary = {
  id: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  trainingName: string;
  isPr: boolean;
  musclesTypes: string[];
  maxWeightSets?: ExerciseLogWithSets;
  latestSets?: ExerciseLogWithSets;
};

export interface ExerciseSummaryResponse extends BaseMeta {
  data: ExerciseSummary[];
}

export type NewestTrainingLog = {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exerciseCount: number;
  totalWeight: number;
};

export type NewestTrainingLogSummaryResponse =
  ApiResponse<NewestTrainingLog | null>;
