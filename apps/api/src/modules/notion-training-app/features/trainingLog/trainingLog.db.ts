/**
 * TRAINING_LOGS DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { z } from "zod";
import {
  notionFormulaString,
  notionLenient,
  notionNumber,
  notionPage,
  notionRelation,
  notionRichText,
  notionRollupNumber,
  notionCreatedTime,
} from "@/integrations/notion/notion.schema";
import { getFormula, getTitle } from "@/integrations/notion/notion.mapper";
import {
  notionDefineProperties,
  notionPropOf,
} from "@/libs/notion/propertyExtract";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import type { NotionTrainingLogProperties } from "./trainingLog.types";
import type { NotionExerciseLogProperties } from "../exerciseLog/exerciseLog.types";
import type { NotionExerciseSetWeightProperties } from "../exerciseSet/exerciseSet.types";
import type {
  NewestTrainingLogItemResponse,
  TrainingLogDetail,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";

/** filter 等でのプロパティ名参照 (typo 防止) */
export const trainingLogProp = notionPropOf<NotionTrainingLogProperties>();

/** 一覧表示に必要な種目ログのプロパティ */
export const trainingLogSummaryExerciseLogProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "exerciseSetsRelation",
    "todayMaxWeightRollup",
    "trainingNameFormula",
    "memo",
    "rest",
  ]);

/** 詳細表示に必要な種目ログのプロパティ */
export const trainingLogDetailExerciseLogProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "exerciseSetsRelation",
    "todayMaxWeightRollup",
    "trainingNameFormula",
    "setsJsonFormula",
    "muslesTypesRollup",
    "memo",
    "rest",
    "goalWeightRollup",
    "exerciseRelation",
  ]);

/** 最新ログ集計に必要な種目ログ/セットのプロパティ */
export const newestLogExerciseLogProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "exerciseSetsRelation",
  ]);
export const exerciseSetWeightProperties =
  notionDefineProperties<NotionExerciseSetWeightProperties>()(["kg", "rep"]);

/** トレーニングログページのスキーマ (一覧/詳細/最新で共用) */
const trainingLogPageSchema = notionPage({
  memo: notionRichText(),
  trainingExercisesRelation: notionRelation(),
  createdTime: notionCreatedTime(),
  bodyWeight: notionNumber(),
  musleTypesFormula: notionFormulaString(),
});

export type TrainingLogPage = z.infer<typeof trainingLogPageSchema>;

export const parseTrainingLogPage = (raw: unknown): TrainingLogPage =>
  trainingLogPageSchema.parse(raw);

/** 一覧表示用の種目ログページのスキーマ */
const summaryExerciseLogPageSchema = notionPage({
  exerciseSetsRelation: notionRelation(),
  todayMaxWeightRollup: notionRollupNumber(),
  trainingNameFormula: notionFormulaString(),
  // NOTE: memo は rich_text プロパティだが従来実装は getTitle で読んでおり常に "" だった。
  // 挙動を変えないため lenient のまま維持 (memo を出すなら notionRichText() に変更する)
  memo: notionLenient(getTitle),
  rest: notionNumber(),
});

export type SummaryExerciseLogPage = z.infer<
  typeof summaryExerciseLogPageSchema
>;

export const parseSummaryExerciseLogPage = (
  raw: unknown,
): SummaryExerciseLogPage => summaryExerciseLogPageSchema.parse(raw);

/** 詳細表示用の種目ログページのスキーマ */
const detailExerciseLogPageSchema = notionPage({
  todayMaxWeightRollup: notionRollupNumber(),
  trainingNameFormula: notionFormulaString(),
  setsJsonFormula: notionFormulaString(),
  // NOTE: rollup プロパティだが従来実装は getFormula("string") で読んでいた (常に null)。
  // 挙動を変えないため lenient のまま維持
  muslesTypesRollup: notionLenient((value) => getFormula(value, "string")),
  memo: notionRichText(),
  rest: notionNumber(),
  goalWeightRollup: notionRollupNumber(),
  exerciseRelation: notionRelation(),
});

export type DetailExerciseLogPage = z.infer<typeof detailExerciseLogPageSchema>;

export const parseDetailExerciseLogPage = (
  raw: unknown,
): DetailExerciseLogPage => detailExerciseLogPageSchema.parse(raw);

/** 最新ログ集計用: 種目ログページ → セットのリレーション ID 配列 */
const newestExerciseLogPageSchema = notionPage({
  exerciseSetsRelation: notionRelation(),
});
export const parseNewestExerciseLogRelations = (raw: unknown): string[] =>
  newestExerciseLogPageSchema.parse(raw).properties.exerciseSetsRelation;

/** 最新ログ集計用: セットページ → { kg, rep } */
const exerciseSetWeightPageSchema = notionPage({
  kg: notionNumber(),
  rep: notionNumber(),
});
export const parseExerciseSetWeight = (
  raw: unknown,
): { kg: number; rep: number } => {
  const page = exerciseSetWeightPageSchema.parse(raw);
  return { kg: page.properties.kg || 0, rep: page.properties.rep || 0 };
};

type TrainingLogSummaryItem = TrainingLogSummaryResponse["data"][number];

/** トレーニングログページ + 紐づく種目ログ → 一覧アイテム */
export function mapTrainingLogSummaryItem(
  trainingLog: TrainingLogPage,
  exerciseLogs: SummaryExerciseLogPage[],
): TrainingLogSummaryItem {
  const relationIds = trainingLog.properties.trainingExercisesRelation;
  return {
    id: trainingLog.id,
    createdTime: trainingLog.properties.createdTime,
    bodyWeight: trainingLog.properties.bodyWeight || 0,
    memo: trainingLog.properties.memo,
    exercises: exerciseLogs
      .filter((exerciseLog) => relationIds.includes(exerciseLog.id))
      .map((exerciseLog) => ({
        name: exerciseLog.properties.trainingNameFormula || "",
        todayMaxWeight: exerciseLog.properties.todayMaxWeightRollup || 0,
        rest: exerciseLog.properties.rest || 0,
        memo: exerciseLog.properties.memo,
        sets: exerciseLog.properties.exerciseSetsRelation.length,
      })),
  };
}

/** 種目ログページ → 詳細表示の1種目分 */
function mapTrainingLogDetailExercise(
  exerciseLog: DetailExerciseLogPage,
): TrainingLogDetail["exercises"][number] {
  const p = exerciseLog.properties;
  return {
    id: exerciseLog.id,
    trainingName: p.trainingNameFormula || "",
    maxGoalWeight: p.goalWeightRollup || 0,
    currentMaxWeight: p.todayMaxWeightRollup || 0,
    isPr: p.todayMaxWeightRollup === p.goalWeightRollup,
    memo: p.memo,
    musclesTypes:
      p.muslesTypesRollup?.split(",").map((part) => part.trim()) || [],
    exerciseSets: {
      exerciseLogId: exerciseLog.id,
      exerciseId: p.exerciseRelation[0] || "",
      createdTime: exerciseLog.created_time,
      rest: p.rest || 0,
      trainingName: p.trainingNameFormula || "",
      sets: parseExerciseSetsText(p.setsJsonFormula, exerciseLog.id),
      notionUrl: exerciseLog.url,
    },
  };
}

/** トレーニングログページ + 紐づく種目ログ → 詳細 (集計値もここで計算) */
export function mapTrainingLogDetail(
  trainingLog: TrainingLogPage,
  exerciseLogs: DetailExerciseLogPage[],
): TrainingLogDetail {
  const properties = trainingLog.properties;
  const exercises = exerciseLogs.map(mapTrainingLogDetailExercise);

  const totalSetsCount = exercises.reduce(
    (acc, exercise) => acc + exercise.exerciseSets.sets.length,
    0,
  );
  const totalTrainingVolumeWeight = exercises.reduce(
    (acc, exercise) =>
      acc +
      exercise.exerciseSets.sets.reduce(
        (setAcc, set) => setAcc + set.kg * set.rep,
        0,
      ),
    0,
  );

  return {
    id: trainingLog.id,
    createdTime: properties.createdTime,
    bodyParts:
      properties.musleTypesFormula?.split(",").map((part) => part.trim()) || [],
    memo: properties.memo,
    bodyWeight: properties.bodyWeight || 0,
    totalExerciseCount: properties.trainingExercisesRelation.length,
    totalSetsCount,
    totalTrainingVolumeWeight,
    exercises,
  };
}

/**
 * トレーニングログ作成入力 → Notion プロパティペイロード。
 * 日付は「当日記録のみ」の運用のため name に当日日付 (YYYY-MM-DD) を設定する
 * (createdTime は Notion が自動採番)。
 */
export function buildCreateTrainingLogProperties(input: {
  dateName: string; // YYYY-MM-DD
  bodyWeight: number | null;
  memo: string;
}): Record<string, unknown> {
  return {
    [trainingLogProp("name")]: {
      title: [{ text: { content: input.dateName } }],
    },
    ...(input.bodyWeight !== null
      ? { [trainingLogProp("bodyWeight")]: { number: input.bodyWeight } }
      : {}),
    ...(input.memo
      ? {
          [trainingLogProp("memo")]: {
            rich_text: [{ text: { content: input.memo } }],
          },
        }
      : {}),
  };
}

/**
 * トレーニングログ更新入力 → Notion プロパティペイロード。
 * 「あるべき状態」への置き換えのため、空値は null / 空配列でクリアする
 * (name / 日付は当日記録運用のため更新対象外)。
 */
export function buildUpdateTrainingLogProperties(input: {
  bodyWeight: number | null;
  memo: string;
}): Record<string, unknown> {
  return {
    [trainingLogProp("bodyWeight")]: { number: input.bodyWeight },
    [trainingLogProp("memo")]: {
      rich_text: input.memo ? [{ text: { content: input.memo } }] : [],
    },
  };
}

/** 最新トレーニングログページ + 集計値 → レスポンスアイテム */
export function mapNewestTrainingLog(
  log: TrainingLogPage,
  totals: { exerciseCount: number; totalWeight: number },
): NewestTrainingLogItemResponse {
  return {
    id: log.id,
    createdTime: log.properties.createdTime,
    bodyWeight: log.properties.bodyWeight || 0,
    memo: log.properties.memo,
    exerciseCount: totals.exerciseCount,
    totalWeight: totals.totalWeight,
  };
}
