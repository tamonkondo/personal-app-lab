/**
 * EXERCISE_LOGS DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { getFormula } from "@/integrations/notion/notion.mapper";
import {
  notionDefineProperties,
  notionPropOf,
  type NotionKeysOfProperties,
} from "@/libs/notion/propertyExtract";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import type {
  NotionExerciseLogPage,
  NotionExerciseLogProperties,
  NotionExerciseLogQueryResult,
} from "./exerciseLog.types";
import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";

/** filter 等でのプロパティ名参照 (typo 防止) */
export const exerciseLogProp = notionPropOf<NotionExerciseLogProperties>();

export const exerciseLogWithSetsProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "rest",
    "trainingNameFormula",
    "setsJsonFormula",
  ]);

export type ExerciseLogWithSetsProperties =
  NotionKeysOfProperties<typeof exerciseLogWithSetsProperties>;

export function mapExerciseLogWithSetsItem(
  exerciseLog: NotionExerciseLogPage<ExerciseLogWithSetsProperties>,
  exerciseId: string,
): ExerciseLogWithSetsItemResponse {
  return {
    exerciseLogId: exerciseLog.id,
    exerciseId,
    rest: exerciseLog.properties.rest.number || 0,
    trainingName:
      getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
    createdTime: exerciseLog.created_time,
    sets: parseExerciseSetsText(
      getFormula(exerciseLog.properties.setsJsonFormula, "string"),
      exerciseLog.id,
    ),
    notionUrl: exerciseLog.url,
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
  exerciseLogs,
  exerciseId,
}: {
  exerciseLogs: NotionExerciseLogQueryResult<ExerciseLogWithSetsProperties>;
  exerciseId: string;
}): ExerciseLogWithSetsItemResponse[] {
  return exerciseLogs.results.map((exerciseLog) =>
    mapExerciseLogWithSetsItem(exerciseLog, exerciseId),
  );
}
