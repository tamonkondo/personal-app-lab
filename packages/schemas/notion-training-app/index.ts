import { z } from "zod";
import {
  EXERCISE_GUIDE_LINE_REPS,
  EXERCISE_TREND_PERIODS,
} from "@repo/types/notion-training-app";
import { paginationQuerySchema } from "../index";

const exercisesSets = z.object({
  kg: z.string(),
  rep: z.string(),
  memo: z.string(),
});
const exercisesSchema = z.object({
  exerciseId: z.string(),
  rest: z.number(),
  memo: z.string(),
  sets: z.array(exercisesSets),
});

export const createTrainingLogSchema = z.object({
  date: z.string(),
  bodyWeight: z.number(),
  memo: z.string(),
  exercises: z.array(exercisesSchema),
});

export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;

export const exerciseDetailParamsSchema = z.object({
  trendPeriod: z.enum(EXERCISE_TREND_PERIODS).nullable().catch(null),
  exerciseGuideLineRep: z.enum(EXERCISE_GUIDE_LINE_REPS).nullable().catch(null),
});

export type ExerciseDetailParams = z.infer<typeof exerciseDetailParamsSchema>;

/**
 * トレーニングログ一覧のクエリ (API 側の req.query 検証用)
 */
export const trainingLogListQuerySchema = paginationQuerySchema.extend({
  startDate: z.string().optional().catch(undefined),
  endDate: z.string().optional().catch(undefined),
  sort: z.enum(["asc", "desc"]).optional().catch(undefined),
  /** カンマ区切りの部位リスト */
  parts: z.string().optional().catch(undefined),
});

export type TrainingLogListQuery = z.infer<typeof trainingLogListQuerySchema>;
