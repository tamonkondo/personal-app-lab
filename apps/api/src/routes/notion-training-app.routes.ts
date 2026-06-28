import { Router } from "express";

import * as trainingLogHandlers from "@/modules/notion-training-app/features/trainingLog/trainingLog.handler";
import * as exerciseHandlers from "@/modules/notion-training-app/features/exercise/exercise.handler";

export const notionTrainingAppRouter = Router();

// トレーニングリスト一覧
notionTrainingAppRouter.get(
  "/training-logs",
  trainingLogHandlers.getTrainingLogs,
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
  "/exercise/summary",
  exerciseHandlers.getExerciseSummaryLogs,
);
notionTrainingAppRouter.get(
  "/exercise/:exerciseId",
  exerciseHandlers.getExerciseDetail,
);
