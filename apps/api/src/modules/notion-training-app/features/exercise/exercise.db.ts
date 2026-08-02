/**
 * EXERCISES DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { z } from "zod";
import {
  notionTitle,
  notionMultiSelect,
  notionNumber,
  notionSelect,
  notionFormulaString,
  notionFormulaNumber,
  notionFormulaDate,
  notionRollupNumber,
  notionRollupArrayNumber,
  notionPage,
} from "@/integrations/notion/notion.schema";
import {
  notionDefineProperties,
  notionPropOf,
} from "@/libs/notion/propertyExtract";
import type { NotionExerciseProperties } from "./exercise.types";
import type {
  ExerciseDetail,
  ExerciseSummaryItem,
  ExerciseLogWithSetsItemResponse,
  ExerciseTrendPeriod,
  ExerciseTrendPoint,
} from "@repo/types/notion-training-app";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from "@repo/schemas/notion-training-app";
import { exerciseRmTypesSchema } from "./exercise.schema";

/** filter 等でのプロパティ名参照 (typo 防止) */
export const exerciseProp = notionPropOf<NotionExerciseProperties>();

export const exerciseNameProperties =
  notionDefineProperties<NotionExerciseProperties>()(["name"]);

export const exerciseSummaryProperties =
  notionDefineProperties<NotionExerciseProperties>()([
    "name",
    "musclesTypes",
    "maxGoalWeightRollup",
    "maxWeightExerciseLogId",
    "latestExerciseLogId",
    "currentMaxWeightRollup",
  ]);

export const exerciseDetailProperties =
  notionDefineProperties<NotionExerciseProperties>()([
    "name",
    "latestTrainingDateFormula",
    "musclesTypes",
    "maxGoalWeightRollup",
    "currentMaxWeightRollup",
    "totalSetsCountFormula",
    "totalTrainingDaysFormula",
    "totalTrainingVolumeWeightFormula",
    "rmTypes",
    "rest",
  ]);

/** 種目名のみのページスキーマ */
const exerciseNamePageSchema = notionPage({
  name: notionTitle(),
});

/** サマリー表示に必要な種目ページのスキーマ */
const exerciseSummaryPageSchema = notionPage({
  name: notionTitle(),
  musclesTypes: notionMultiSelect(),
  maxGoalWeightRollup: notionRollupArrayNumber(),
  maxWeightExerciseLogId: notionFormulaString(),
  latestExerciseLogId: notionFormulaString(),
  currentMaxWeightRollup: notionRollupNumber(),
});

/** 詳細表示に必要な種目ページのスキーマ */
const exerciseDetailPageSchema = notionPage({
  name: notionTitle(),
  latestTrainingDateFormula: notionFormulaDate(),
  musclesTypes: notionMultiSelect(),
  maxGoalWeightRollup: notionRollupArrayNumber(),
  currentMaxWeightRollup: notionRollupNumber(),
  totalSetsCountFormula: notionFormulaNumber(),
  totalTrainingDaysFormula: notionFormulaNumber(),
  totalTrainingVolumeWeightFormula: notionFormulaNumber(),
  rmTypes: notionSelect(),
  rest: notionNumber(),
});

/** トレンド表示に必要な種目ページのスキーマ */
const exerciseTrendsPageSchema = notionPage({
  maxGoalWeightRollup: notionRollupArrayNumber(),
});

export type ExerciseSummaryPage = z.infer<typeof exerciseSummaryPageSchema>;

export const parseExerciseSummaryPage = (raw: unknown): ExerciseSummaryPage =>
  exerciseSummaryPageSchema.parse(raw);

/** 種目ページから最新/最大重量ログの参照 ID を読む */
export function readExerciseLogRefs(exercise: ExerciseSummaryPage): {
  latestExerciseLogId: string | null;
  maxWeightExerciseLogId: string | null;
} {
  return {
    latestExerciseLogId: exercise.properties.latestExerciseLogId,
    maxWeightExerciseLogId: exercise.properties.maxWeightExerciseLogId,
  };
}

/** 生の Notion ページ (unknown) → {id, name} */
export function mapExerciseName(raw: unknown): { id: string; name: string } {
  const page = exerciseNamePageSchema.parse(raw);
  return { id: page.id, name: page.properties.name };
}

/** パース済みページ + セット情報 → 種目サマリー */
export function mapExerciseSummaryItem(
  exercise: ExerciseSummaryPage,
  logWithSets: {
    maxWeightSets: ExerciseLogWithSetsItemResponse;
    latestSets: ExerciseLogWithSetsItemResponse;
  },
): ExerciseSummaryItem {
  const p = exercise.properties;
  const maxGoalWeight = p.maxGoalWeightRollup || 0;
  const currentMaxWeight = p.currentMaxWeightRollup || 0;
  return {
    id: exercise.id,
    musclesTypes: p.musclesTypes,
    trainingName: p.name,
    maxGoalWeight,
    currentMaxWeight,
    isPr: currentMaxWeight > maxGoalWeight,
    exerciseUrl: exercise.url,
    maxWeightSets: logWithSets.maxWeightSets,
    latestSets: logWithSets.latestSets,
  };
}

/** 生の Notion ページ (unknown) → 種目詳細 */
export function mapExerciseDetail(raw: unknown): ExerciseDetail {
  const page = exerciseDetailPageSchema.parse(raw);
  const p = page.properties;
  return {
    id: page.id,
    exerciseName: p.name,
    latestTrainingDate: p.latestTrainingDateFormula?.start || "",
    musclesTypes: p.musclesTypes,
    trainingName: p.name,
    maxGoalWeight: p.maxGoalWeightRollup || 0,
    currentMaxWeight: p.currentMaxWeightRollup || 0,
    totalSetsCount: p.totalSetsCountFormula || 0,
    totalTrainingDays: p.totalTrainingDaysFormula || 0,
    totalTrainingVolumeWeight: p.totalTrainingVolumeWeightFormula || 0,
    rmTypes: exerciseRmTypesSchema.parse(p.rmTypes),
    rest: p.rest,
  };
}

/**
 * 種目マスタ作成入力 → Notion プロパティペイロード。
 * 目標重量 (GOAL_WEIGHTS リレーション) はここでは扱わない (Notion 側で管理)。
 */
export function buildCreateExerciseProperties(
  input: CreateExerciseInput,
): Record<string, unknown> {
  return {
    [exerciseProp("name")]: {
      title: [{ text: { content: input.name } }],
    },
    ...(input.musclesTypes.length > 0
      ? {
          [exerciseProp("musclesTypes")]: {
            multi_select: input.musclesTypes.map((name) => ({ name })),
          },
        }
      : {}),
    ...(input.rmTypes !== null
      ? { [exerciseProp("rmTypes")]: { select: { name: input.rmTypes } } }
      : {}),
    ...(input.rest !== null
      ? { [exerciseProp("rest")]: { number: input.rest } }
      : {}),
  };
}

/**
 * 種目マスタ更新入力 → Notion プロパティペイロード。
 * undefined のフィールドは含めない (変更しない)。null / 空配列はクリア。
 */
export function buildUpdateExerciseProperties(
  input: UpdateExerciseInput,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  if (input.name !== undefined) {
    properties[exerciseProp("name")] = {
      title: [{ text: { content: input.name } }],
    };
  }
  if (input.musclesTypes !== undefined) {
    properties[exerciseProp("musclesTypes")] = {
      multi_select: input.musclesTypes.map((name) => ({ name })),
    };
  }
  if (input.rmTypes !== undefined) {
    properties[exerciseProp("rmTypes")] = {
      select: input.rmTypes === null ? null : { name: input.rmTypes },
    };
  }
  if (input.rest !== undefined) {
    properties[exerciseProp("rest")] = { number: input.rest };
  }
  return properties;
}

/** 生の Notion ページ (unknown) → 種目トレンド */
export function mapExerciseTrends(raw: unknown): { maxGoalWeight: number } {
  const page = exerciseTrendsPageSchema.parse(raw);
  return { maxGoalWeight: page.properties.maxGoalWeightRollup || 0 };
}

/** トレンド期間 → 取得開始日時 (ISO)。"all" は null (期間フィルタなし) */
export function trendPeriodStart(
  period: ExerciseTrendPeriod,
  now: Date,
): string | null {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const days: Record<Exclude<ExerciseTrendPeriod, "all">, number> = {
    "1w": 7,
    "2w": 14,
    "4w": 28,
    "6m": 183,
    "1y": 365,
  };
  if (period === "all") return null;
  return new Date(now.getTime() - days[period] * DAY_MS).toISOString();
}

/**
 * セット付き種目ログ → トレンドの時系列点。
 * 1ログ = 1点。トップセット重量 / 総ボリューム / セット数をここで集計する。
 * セットが1件もないログは点にしない。
 */
export function buildExerciseTrendPoints(
  logs: ExerciseLogWithSetsItemResponse[],
): ExerciseTrendPoint[] {
  return logs
    .filter((log) => log.sets.length > 0)
    .map((log) => ({
      exerciseLogId: log.exerciseLogId,
      date: log.createdTime,
      maxWeight: Math.max(...log.sets.map((set) => set.kg)),
      totalVolume: log.sets.reduce((acc, set) => acc + set.kg * set.rep, 0),
      setsCount: log.sets.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
