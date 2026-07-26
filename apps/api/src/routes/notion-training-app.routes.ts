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
notionTrainingAppRouter.get(
  "/training-logs/newest",
  trainingLogHandlers.getNewestTrainingLog,
);
notionTrainingAppRouter.get(
  "/training-logs/:id",
  trainingLogHandlers.getTrainingLogDetail,
);
// 最新のトレーニングログの取得
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
