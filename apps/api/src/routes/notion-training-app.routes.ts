import { Router } from "express";
import * as handlers from "../modules/notion-training-app/notion-training-app.handlers";

export const notionTrainingAppRouter = Router();

// トレーニングリスト一覧
notionTrainingAppRouter.get("/training-logs", handlers.getTrainingLogs);
notionTrainingAppRouter.post("/training-logs", handlers.createTrainingLog);
// 特定の日付のトレーニングリスト
notionTrainingAppRouter.get("/training-logs/:id", handlers.getTrainingLog);
notionTrainingAppRouter.patch("/training-logs/:id", handlers.updateTrainingLog);
notionTrainingAppRouter.delete(
  "/training-logs/:id",
  handlers.deleteTrainingLog,
);
// 特定の日付のトレーニングリストの詳細（トレーニング種目のログも含む）
notionTrainingAppRouter.get(
  "/training-logs/:id/detail",
  handlers.getTraininngLogDetail,
);
// トレーニングの目標重量
notionTrainingAppRouter.get("/goal-weights", handlers.getGoalWeights);
notionTrainingAppRouter.get("/goal-weights/:id", handlers.getGoalWeightsDetail);
// トレーニング種目一覧
notionTrainingAppRouter.get("/exercise", handlers.getExercise);
notionTrainingAppRouter.post("/exercise", handlers.createExercise);
notionTrainingAppRouter.patch("/exercise", handlers.updateExercise);
notionTrainingAppRouter.delete("/exercise", handlers.deleteExercise);
// トレーニング種目の詳細
notionTrainingAppRouter.get("/exercise/:id", handlers.getExerciseDetail);
notionTrainingAppRouter.post("/exercise/:id", handlers.createExerciseDetail);
notionTrainingAppRouter.patch("/exercise/:id", handlers.updateExerciseDetail);
notionTrainingAppRouter.delete("/exercise/:id", handlers.deleteExerciseDetail);
// トレーニング種目のログ一覧
notionTrainingAppRouter.get("/exercise-logs", handlers.getExerciseLogs);
// トレーニング種目の各ログ
notionTrainingAppRouter.get("/exercise-logs/:id", handlers.getExerciseLog);
notionTrainingAppRouter.post("/exercise-logs/:id", handlers.createExerciseLog);
notionTrainingAppRouter.patch("/exercise-logs/:id", handlers.updateExerciseLog);
notionTrainingAppRouter.delete(
  "/exercise-logs/:id",
  handlers.deleteExerciseLog,
);
// トレーニング種目の1セットのログ一覧
notionTrainingAppRouter.get("/exercise-set-logs", handlers.getExerciseSetLogs);
// トレーニング種目の1セットのログ詳細
notionTrainingAppRouter.get(
  "/exercise-set-logs/:id",
  handlers.getExerciseSetLog,
);
notionTrainingAppRouter.post(
  "/exercise-set-logs/:id",
  handlers.createExerciseSetLog,
);
notionTrainingAppRouter.patch(
  "/exercise-set-logs/:id",
  handlers.updateExerciseSetLog,
);
notionTrainingAppRouter.delete(
  "/exercise-set-logs/:id",
  handlers.deleteExerciseSetLog,
);
