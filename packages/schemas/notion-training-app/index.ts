import { z } from "zod";
import {
  EXERCISE_GUIDE_LINE_REPS,
  EXERCISE_RM_TYPES,
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

/**
 * トレーニング記録 更新の入力。
 * ネスト全体を「あるべき状態」として受け取り、サーバ側で差分同期する。
 * - setId / logId を持つ要素は既存 (更新対象)、持たない要素は新規 (作成対象)
 * - 入力に含まれない既存の種目ログ / セットはアーカイブ (削除) される
 */
const updateTrainingLogSetSchema = z.object({
  /** 既存セットの Notion ページ ID。未指定なら新規作成 */
  setId: z.string().optional(),
  kg: z.coerce.number().min(0),
  rep: z.coerce.number().int().min(0),
  memo: z.string().optional().default(""),
});
const updateTrainingLogExerciseSchema = z.object({
  /** 既存の種目ログの Notion ページ ID。未指定なら新規作成 */
  logId: z.string().optional(),
  exerciseId: z.string().min(1),
  rest: z.number().min(0).nullable().optional().default(null),
  memo: z.string().optional().default(""),
  sets: z.array(updateTrainingLogSetSchema).min(1),
});

export const updateTrainingLogSchema = z.object({
  bodyWeight: z.coerce.number().positive().nullable().optional().default(null),
  memo: z.string().optional().default(""),
  exercises: z.array(updateTrainingLogExerciseSchema).min(1),
});

export type UpdateTrainingLogInput = z.infer<typeof updateTrainingLogSchema>;
export type UpdateTrainingLogExerciseInput = z.infer<
  typeof updateTrainingLogExerciseSchema
>;
export type UpdateTrainingLogSetInput = z.infer<
  typeof updateTrainingLogSetSchema
>;

export const exerciseDetailParamsSchema = z.object({
  trendPeriod: z.enum(EXERCISE_TREND_PERIODS).nullable().catch(null),
  exerciseGuideLineRep: z.enum(EXERCISE_GUIDE_LINE_REPS).nullable().catch(null),
});

/** 種目トレンド API のクエリ (期間指定。未指定/不正値は 4w) */
export const exerciseTrendsQuerySchema = z.object({
  period: z.enum(EXERCISE_TREND_PERIODS).catch("4w"),
});

export type ExerciseTrendsQuery = z.infer<typeof exerciseTrendsQuerySchema>;

/**
 * 種目マスタ 作成の入力。
 * 目標重量は別 DB (GOAL_WEIGHTS) のリレーション + ロールアップのため
 * ここでは扱わない (Notion 側で管理)。
 */
export const createExerciseSchema = z.object({
  name: z.string().trim().min(1),
  /** 対象部位 (multi_select の値)。BODY_PARTS の value を渡す */
  musclesTypes: z.array(z.string().min(1)).optional().default([]),
  rmTypes: z.enum(EXERCISE_RM_TYPES).nullable().optional().default(null),
  /** デフォルト休憩時間 (秒) */
  rest: z.coerce.number().min(0).nullable().optional().default(null),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

/**
 * 種目マスタ 更新の入力。
 * undefined のフィールドは「変更しない」。null / 空配列は「クリアする」。
 */
export const updateExerciseSchema = z.object({
  name: z.string().trim().min(1).optional(),
  musclesTypes: z.array(z.string().min(1)).optional(),
  rmTypes: z.enum(EXERCISE_RM_TYPES).nullable().optional(),
  rest: z.coerce.number().min(0).nullable().optional(),
});

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

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
