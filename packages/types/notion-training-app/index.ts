import { ApiResponse } from "../index";
/**
 *  共通のAPIを定義する。
 * APIの出入口
 *
 */

// トレーニングの登録
// トレーニングデータの取得
//

// 最新のトレーニングログを取得するAPI
export interface NewestTrainingLog {
  id: string;
  createdTime: string;
  bodyWeight: number;
  memo: string;
  trainingExercisesRelation: string[];
}
// トレーニングログ
export interface TrainingLogResponse {
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
export type TrainingLogResponseData = ApiResponse<TrainingLogResponse[]>;

export interface ExerciseLogResponse {
  id: string;
  createdTime: string;
  todayMaxWeight: number;
  trainingName: string;
  rest: number;
  exerciseSets: {
    id: string;
    kg: number;
    rep: number;
    memo: string;
    displayText: string;
    maxWeight: number;
  }[];
}
