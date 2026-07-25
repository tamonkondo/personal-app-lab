/**
 * EXERCISES DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  getFormula,
  getRollup,
  getRollupArrayValue,
} from "@/integrations/notion/notion.mapper";
import {
  notionDefineProperties,
  notionPropOf,
  type NotionKeysOfProperties,
} from "@/libs/notion/propertyExtract";
import type {
  NotionExercisePage,
  NotionExerciseProperties,
} from "./exercise.types";
import type {
  ExerciseDetail,
  ExerciseSummaryItem,
  ExerciseLogWithSetsItemResponse,
} from "@repo/types/notion-training-app";
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
  ]);

export type ExerciseSummaryPage = NotionExercisePage<
  NotionKeysOfProperties<typeof exerciseSummaryProperties>
>;
export type ExerciseDetailPage = NotionExercisePage<
  NotionKeysOfProperties<typeof exerciseDetailProperties>
>;

/** 共通の rollup 読み取り (summary / detail / trends で共用) */
function readMaxGoalWeight(
  page: NotionExercisePage<"maxGoalWeightRollup">,
): number {
  return (
    getRollupArrayValue(page.properties.maxGoalWeightRollup, "number") || 0
  );
}

function readCurrentMaxWeight(
  page: NotionExercisePage<"currentMaxWeightRollup">,
): number {
  return (
    Number(getRollup(page.properties.currentMaxWeightRollup, "number")) || 0
  );
}

/** 種目ページから最新/最大重量ログの参照 ID を読む */
export function readExerciseLogRefs(
  exercise: NotionExercisePage<"latestExerciseLogId" | "maxWeightExerciseLogId">,
): {
  latestExerciseLogId: string | null;
  maxWeightExerciseLogId: string | null;
} {
  return {
    latestExerciseLogId: getFormula(
      exercise.properties.latestExerciseLogId,
      "string",
    ),
    maxWeightExerciseLogId: getFormula(
      exercise.properties.maxWeightExerciseLogId,
      "string",
    ),
  };
}

/** Notion ページ + セット情報 → 種目サマリー */
export function mapExerciseSummaryItem(
  exercise: ExerciseSummaryPage,
  logWithSets: {
    maxWeightSets: ExerciseLogWithSetsItemResponse;
    latestSets: ExerciseLogWithSetsItemResponse;
  },
): ExerciseSummaryItem {
  const maxGoalWeight = readMaxGoalWeight(exercise);
  const currentMaxWeight = readCurrentMaxWeight(exercise);
  return {
    id: exercise.id,
    musclesTypes:
      exercise.properties.musclesTypes.multi_select?.map(
        (muscle) => muscle.name,
      ) || [],
    trainingName: exercise.properties.name.title?.[0]?.plain_text || "",
    maxGoalWeight,
    currentMaxWeight,
    isPr: currentMaxWeight > maxGoalWeight,
    exerciseUrl: exercise.url,
    maxWeightSets: logWithSets.maxWeightSets,
    latestSets: logWithSets.latestSets,
  };
}

/** Notion ページ → 種目詳細 */
export function mapExerciseDetail(exercise: ExerciseDetailPage): ExerciseDetail {
  const properties = exercise.properties;
  return {
    id: exercise.id,
    exerciseName: properties.name.title?.[0]?.plain_text || "",
    latestTrainingDate:
      getFormula(properties.latestTrainingDateFormula, "date")?.start || "",
    musclesTypes:
      properties.musclesTypes.multi_select?.map((muscle) => muscle.name) || [],
    trainingName: properties.name.title?.[0]?.plain_text || "",
    maxGoalWeight: readMaxGoalWeight(exercise),
    currentMaxWeight: readCurrentMaxWeight(exercise),
    totalSetsCount: getFormula(properties.totalSetsCountFormula, "number") || 0,
    totalTrainingDays:
      getFormula(properties.totalTrainingDaysFormula, "number") || 0,
    totalTrainingVolumeWeight:
      getFormula(properties.totalTrainingVolumeWeightFormula, "number") || 0,
    rmTypes: exerciseRmTypesSchema.parse(properties.rmTypes.select?.name),
  };
}

/** Notion ページ → 種目トレンド */
export function mapExerciseTrends(
  exercise: NotionExercisePage<"maxGoalWeightRollup">,
): { maxGoalWeight: number } {
  return { maxGoalWeight: readMaxGoalWeight(exercise) };
}
