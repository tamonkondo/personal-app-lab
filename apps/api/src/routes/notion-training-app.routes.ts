import { Router } from "express";

import * as trainingLogHandlers from "@/modules/notion-training-app/features/trainingLog/trainingLog.handler";
import * as exerciseHandlers from "@/modules/notion-training-app/features/exercise/exercise.handler";

export const notionTrainingAppRouter = Router();

// トレーニングリスト一覧
notionTrainingAppRouter.get(
  "/training-logs",
  trainingLogHandlers.getTrainingLogs,
);
// トレーニング記録の作成 (当日記録のみ)
notionTrainingAppRouter.post(
  "/training-logs",
  trainingLogHandlers.createTrainingLog,
);
// トレーニング記録の更新 (ネスト全体を差分同期)
notionTrainingAppRouter.put(
  "/training-logs/:id",
  trainingLogHandlers.updateTrainingLog,
);
// トレーニング記録の削除 (種目ログ・セットもまとめてアーカイブ)
notionTrainingAppRouter.delete(
  "/training-logs/:id",
  trainingLogHandlers.deleteTrainingLog,
);
notionTrainingAppRouter.get(
  "/training-logs/newest",
  trainingLogHandlers.getNewestTrainingLog,
);
notionTrainingAppRouter.get(
  "/training-logs/:id",
  trainingLogHandlers.getTrainingLogDetail,
);
// 種目マスタの作成
notionTrainingAppRouter.post("/exercise", exerciseHandlers.createExercise);
// 種目マスタの更新
notionTrainingAppRouter.patch(
  "/exercise/:exerciseId",
  exerciseHandlers.updateExercise,
);
// 種目マスタの削除 (記録が紐づく種目は 409)
notionTrainingAppRouter.delete(
  "/exercise/:exerciseId",
  exerciseHandlers.deleteExercise,
);
// 種目名一覧の取得
notionTrainingAppRouter.get(
  "/exercise/names",
  exerciseHandlers.getExerciseNames,
);
notionTrainingAppRouter.get(
  "/exercise/summary",
  exerciseHandlers.getExerciseSummaryLogs,
);
notionTrainingAppRouter.get(
  "/exercise/:exerciseId",
  exerciseHandlers.getExerciseDetail,
);
notionTrainingAppRouter.get(
  "/exercise/:exerciseId/logs",
  exerciseHandlers.getExerciseLogs,
);
notionTrainingAppRouter.get(
  "/exercise/:exerciseId/trends",
  exerciseHandlers.getExerciseTrends,
);
