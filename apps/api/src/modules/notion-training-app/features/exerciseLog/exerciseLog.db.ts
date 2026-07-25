/**
 * EXERCISE_LOGS DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  notionFormulaString,
  notionNumber,
  notionPage,
} from "@/integrations/notion/notion.schema";
import {
  notionDefineProperties,
  notionPropOf,
} from "@/libs/notion/propertyExtract";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import type { NotionExerciseLogProperties } from "./exerciseLog.types";
import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";

/** filter 等でのプロパティ名参照 (typo 防止) */
export const exerciseLogProp = notionPropOf<NotionExerciseLogProperties>();

export const exerciseLogWithSetsProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "rest",
    "trainingNameFormula",
    "setsJsonFormula",
  ]);

/** セット表示に必要な種目ログページのスキーマ */
const exerciseLogWithSetsPageSchema = notionPage({
  rest: notionNumber(),
  trainingNameFormula: notionFormulaString(),
  setsJsonFormula: notionFormulaString(),
});

/** 生の Notion ページ (unknown) → セット付き種目ログ */
export function mapExerciseLogWithSetsItem(
  raw: unknown,
  exerciseId: string,
): ExerciseLogWithSetsItemResponse {
  const page = exerciseLogWithSetsPageSchema.parse(raw);
  const p = page.properties;
  return {
    exerciseLogId: page.id,
    exerciseId,
    rest: p.rest || 0,
    trainingName: p.trainingNameFormula || "",
    createdTime: page.created_time,
    sets: parseExerciseSetsText(p.setsJsonFormula, page.id),
    notionUrl: page.url,
  };
}

export function emptyExerciseLogWithSets(
  exerciseId: string,
): ExerciseLogWithSetsItemResponse {
  return {
    exerciseLogId: "",
    exerciseId,
    rest: 0,
    trainingName: "",
    createdTime: "",
    sets: [],
    notionUrl: "",
  };
}

export function mapExerciseLogsWithSets({
  results,
  exerciseId,
}: {
  results: unknown[];
  exerciseId: string;
}): ExerciseLogWithSetsItemResponse[] {
  return results.map((raw) => mapExerciseLogWithSetsItem(raw, exerciseId));
}
