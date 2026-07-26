import { z } from "zod";
import {
  EXERCISE_GUIDE_LINE_REPS,
  EXERCISE_TREND_PERIODS,
} from "@repo/types/notion-training-app";
import { paginationQuerySchema } from "../index";

/**
 * トレーニング記録 新規作成の入力。
 * 日付は「当日記録のみ」の運用のため入力に含めない (サーバ側で当日を採用)。
 * フォーム入力は文字列で来るため kg / rep は coerce する。
 */
const createTrainingLogSetSchema = z.object({
  kg: z.coerce.number().min(0),
  rep: z.coerce.number().int().min(0),
  memo: z.string().optional().default(""),
});
const createTrainingLogExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  rest: z.number().min(0).nullable().optional().default(null),
  memo: z.string().optional().default(""),
  sets: z.array(createTrainingLogSetSchema).min(1),
});

export const createTrainingLogSchema = z.object({
  bodyWeight: z.coerce.number().positive().nullable().optional().default(null),
  memo: z.string().optional().default(""),
  exercises: z.array(createTrainingLogExerciseSchema).min(1),
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
