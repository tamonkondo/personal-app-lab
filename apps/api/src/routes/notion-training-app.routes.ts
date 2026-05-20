import { Router } from "express";

import * as trainingLogHandlers from "@/modules/notion-training-app/features/trainingLog/trainingLog.handler";
import * as goalWeightHandlers from "@/modules/notion-training-app/features/goalWeight/goalWeight.handler";
import * as exerciseHandlers from "@/modules/notion-training-app/features/exercise/exercise.handler";
import * as exerciseLogHandlers from "@/modules/notion-training-app/features/exerciseLog/exerciseLog.handler";
import * as exerciseSetHandlers from "@/modules/notion-training-app/features/exerciseSet/exerciseSet.handler";
export const notionTrainingAppRouter = Router();

// トレーニングリスト一覧
notionTrainingAppRouter.get(
  "/training-logs",
  trainingLogHandlers.getTrainingLogs,
);
notionTrainingAppRouter.post(
  "/training-logs",
  trainingLogHandlers.createTrainingLog,
);
// 特定の日付のトレーニングリスト
notionTrainingAppRouter.get(
  "/training-logs/:id",
  trainingLogHandlers.getTrainingLog,
);
notionTrainingAppRouter.patch(
  "/training-logs/:id",
  trainingLogHandlers.updateTrainingLog,
);
notionTrainingAppRouter.delete(
  "/training-logs/:id",
  trainingLogHandlers.deleteTrainingLog,
);
// 特定の日付のトレーニングリストの詳細（トレーニング種目のログも含む）
notionTrainingAppRouter.get(
  "/training-logs/:id/detail",
  trainingLogHandlers.getTrainingLogDetail,
);
// トレーニングの目標重量
notionTrainingAppRouter.get("/goal-weights", goalWeightHandlers.getGoalWeights);
notionTrainingAppRouter.get(
  "/goal-weights/:id",
  goalWeightHandlers.getGoalWeightsDetail,
);
// トレーニング種目一覧
notionTrainingAppRouter.get(
  "/exercises/:id",
  exerciseHandlers.getExercises,
);
notionTrainingAppRouter.post("/exercises", exerciseHandlers.createExercise);
notionTrainingAppRouter.patch("/exercises", exerciseHandlers.updateExercise);
notionTrainingAppRouter.delete("/exercises", exerciseHandlers.deleteExercise);
// トレーニング種目の詳細
notionTrainingAppRouter.get(
  "/exercises/:id",
  exerciseHandlers.getExerciseDetail,
);
notionTrainingAppRouter.post(
  "/exercises/:id",
  exerciseHandlers.createExerciseDetail,
);
notionTrainingAppRouter.patch(
  "/exercises/:id",
  exerciseHandlers.updateExerciseDetail,
);
notionTrainingAppRouter.delete(
  "/exercises/:id",
  exerciseHandlers.deleteExerciseDetail,
);
// トレーニング種目のログ一覧
notionTrainingAppRouter.get(
  "/exercise-logs/:exerciseId",
  exerciseLogHandlers.getExerciseLogs,
);
// トレーニング種目の各ログ
notionTrainingAppRouter.get(
  "/exercise-logs/:id/detail",
  exerciseLogHandlers.getExerciseLog,
);
notionTrainingAppRouter.post(
  "/exercise-logs/:id",
  exerciseLogHandlers.createExerciseLog,
);
notionTrainingAppRouter.patch(
  "/exercise-logs/:id",
  exerciseLogHandlers.updateExerciseLog,
);
notionTrainingAppRouter.delete(
  "/exercise-logs/:id",
  exerciseLogHandlers.deleteExerciseLog,
);
// トレーニング種目の1セットのログ一覧
notionTrainingAppRouter.get(
  "/exercise-set-logs",
  exerciseSetHandlers.getExerciseSetLogs,
);
// トレーニング種目の1セットのログ詳細
notionTrainingAppRouter.get(
  "/exercise-set-logs/:id",
  exerciseSetHandlers.getExerciseSetLog,
);
notionTrainingAppRouter.post(
  "/exercise-set-logs/:id",
  exerciseSetHandlers.createExerciseSetLog,
);
notionTrainingAppRouter.patch(
  "/exercise-set-logs/:id",
  exerciseSetHandlers.updateExerciseSetLog,
);
notionTrainingAppRouter.delete(
  "/exercise-set-logs/:id",
  exerciseSetHandlers.deleteExerciseSetLog,
);
