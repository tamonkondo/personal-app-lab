/**
 * TRAINING_LOGS DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  getFormula,
  getRelationIds,
  getRollup,
  getTitle,
} from "@/integrations/notion/notion.mapper";
import {
  notionDefineProperties,
  notionPropOf,
  type NotionKeysOfProperties,
} from "@/libs/notion/propertyExtract";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import type {
  NotionTrainingLogPage,
  NotionTrainingLogProperties,
} from "./trainingLog.types";
import type {
  NotionExerciseLogPage,
  NotionExerciseLogProperties,
} from "../exerciseLog/exerciseLog.types";
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

export type TrainingLogSummaryExerciseLogPage = NotionExerciseLogPage<
  NotionKeysOfProperties<typeof trainingLogSummaryExerciseLogProperties>
>;
export type TrainingLogDetailExerciseLogPage = NotionExerciseLogPage<
  NotionKeysOfProperties<typeof trainingLogDetailExerciseLogProperties>
>;

type TrainingLogSummaryItem =
  TrainingLogSummaryResponse["data"][number];

/** トレーニングログページ + 紐づく種目ログ → 一覧アイテム */
export function mapTrainingLogSummaryItem(
  trainingLog: NotionTrainingLogPage,
  exerciseLogs: TrainingLogSummaryExerciseLogPage[],
): TrainingLogSummaryItem {
  return {
    id: trainingLog.id,
    createdTime: trainingLog.properties.createdTime.created_time,
    bodyWeight: trainingLog.properties.bodyWeight.number || 0,
    memo: trainingLog.properties.memo.rich_text[0]?.plain_text || "",
    exercises: exerciseLogs
      .filter((exerciseLog) =>
        trainingLog.properties.trainingExercisesRelation.relation?.some(
          (relation) => relation.id === exerciseLog.id,
        ),
      )
      .map((exerciseLog) => ({
        name:
          getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
          "",
        todayMaxWeight:
          Number(
            getRollup(exerciseLog.properties.todayMaxWeightRollup, "number"),
          ) || 0,
        rest: exerciseLog.properties.rest.number || 0,
        memo: getTitle(exerciseLog.properties.memo),
        sets:
          getRelationIds(exerciseLog.properties.exerciseSetsRelation)?.length ||
          0,
      })),
  };
}

/** 種目ログページ → 詳細表示の1種目分 */
function mapTrainingLogDetailExercise(
  exerciseLog: TrainingLogDetailExerciseLogPage,
): TrainingLogDetail["exercises"][number] {
  return {
    id: exerciseLog.id,
    trainingName:
      getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
    maxGoalWeight:
      getRollup(exerciseLog.properties.goalWeightRollup, "number") || 0,
    currentMaxWeight:
      getRollup(exerciseLog.properties.todayMaxWeightRollup, "number") || 0,
    isPr:
      getRollup(exerciseLog.properties.todayMaxWeightRollup, "number") ===
      getRollup(exerciseLog.properties.goalWeightRollup, "number"),
    musclesTypes:
      getFormula(exerciseLog.properties.muslesTypesRollup, "string")
        ?.split(",")
        .map((part) => part.trim()) || [],
    exerciseSets: {
      exerciseLogId: exerciseLog.id,
      exerciseId:
        getRelationIds(exerciseLog.properties.exerciseRelation)[0] || "",
      createdTime: exerciseLog.created_time,
      rest: exerciseLog.properties.rest.number || 0,
      trainingName:
        getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
      sets: parseExerciseSetsText(
        getFormula(exerciseLog.properties.setsJsonFormula, "string"),
        exerciseLog.id,
      ),
      notionUrl: exerciseLog.url,
    },
  };
}

/** トレーニングログページ + 紐づく種目ログ → 詳細 (集計値もここで計算) */
export function mapTrainingLogDetail(
  trainingLog: NotionTrainingLogPage,
  exerciseLogs: TrainingLogDetailExerciseLogPage[],
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
    createdTime: properties.createdTime.created_time,
    bodyParts:
      getFormula(properties.musleTypesFormula, "string")
        ?.split(",")
        .map((part) => part.trim()) || [],
    memo: properties.memo.rich_text[0]?.plain_text || "",
    bodyWeight: properties.bodyWeight.number || 0,
    totalExerciseCount: properties.trainingExercisesRelation.relation
      ? properties.trainingExercisesRelation.relation.length
      : 0,
    totalSetsCount,
    totalTrainingVolumeWeight,
    exercises,
  };
}

/** 最新トレーニングログページ + 集計値 → レスポンスアイテム */
export function mapNewestTrainingLog(
  log: NotionTrainingLogPage,
  totals: { exerciseCount: number; totalWeight: number },
): NewestTrainingLogItemResponse {
  return {
    id: log.id,
    createdTime: log.properties.createdTime.created_time,
    bodyWeight: log.properties.bodyWeight.number || 0,
    memo: log.properties.memo.rich_text[0]?.plain_text || "",
    exerciseCount: totals.exerciseCount,
    totalWeight: totals.totalWeight,
  };
}
