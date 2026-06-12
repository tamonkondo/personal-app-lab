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
// 最新のトレーニングログの取得
notionTrainingAppRouter.get(
  "/training-logs/newest",
  trainingLogHandlers.getNewestTrainingLog,
);
// トレーニングの目標重量
notionTrainingAppRouter.get("/goal-weights", goalWeightHandlers.getGoalWeights);
notionTrainingAppRouter.get(
  "/goal-weights/:id",
  goalWeightHandlers.getGoalWeightsDetail,
);
// トレーニング種目一覧
notionTrainingAppRouter.get("/exercises/:id", exerciseHandlers.getExercises);
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
notionTrainingAppRouter.get(
  "/exercise/summary",
  exerciseHandlers.getExerciseSummaryLogs,
);
// トレーニング種目のログ一覧

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
  "/exercise-sets",
  exerciseSetHandlers.getExerciseSets,
);
// トレーニング種目の1セットのログ詳細
notionTrainingAppRouter.get(
  "/exercise-sets/:id",
  exerciseSetHandlers.getExerciseSet,
);
notionTrainingAppRouter.post(
  "/exercise-sets/:id",
  exerciseSetHandlers.createExerciseSet,
);
notionTrainingAppRouter.patch(
  "/exercise-sets/:id",
  exerciseSetHandlers.updateExerciseSet,
);
notionTrainingAppRouter.delete(
  "/exercise-sets/:id",
  exerciseSetHandlers.deleteExerciseSet,
);
