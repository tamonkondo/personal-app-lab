/**
 * EXERCISE_LOGS DB の定義ファイル。
 * 取得プロパティのリストと「ページ → ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  notionDate,
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
    "date",
  ]);

/** セット表示に必要な種目ログページのスキーマ */
const exerciseLogWithSetsPageSchema = notionPage({
  rest: notionNumber(),
  trainingNameFormula: notionFormulaString(),
  setsJsonFormula: notionFormulaString(),
  // date プロパティが Notion 側に未作成の環境でもパースを壊さないよう optional + catch
  date: notionDate().optional().catch(undefined),
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
    // 記録日は date プロパティ優先 (未設定の旧レコードは created_time)
    createdTime: p.date?.start ?? page.created_time,
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

/**
 * 種目ログ作成入力 → Notion プロパティペイロード。
 * name は既存規則 "record__<既存ログ数+1>__<種目名>" に合わせる。
 * date は親トレーニングログの記録日 (YYYY-MM-DD) を設定する (トレンド集計用)。
 */
export function buildCreateExerciseLogProperties(input: {
  recordNumber: number;
  exerciseName: string;
  date: string; // YYYY-MM-DD
  rest: number | null;
  memo: string;
  exerciseId: string;
  trainingLogId: string;
}): Record<string, unknown> {
  return {
    [exerciseLogProp("name")]: {
      title: [
        {
          text: {
            content: `record__${input.recordNumber}__${input.exerciseName}`,
          },
        },
      ],
    },
    [exerciseLogProp("date")]: { date: { start: input.date } },
    ...(input.rest !== null
      ? { [exerciseLogProp("rest")]: { number: input.rest } }
      : {}),
    ...(input.memo
      ? {
          [exerciseLogProp("memo")]: {
            rich_text: [{ text: { content: input.memo } }],
          },
        }
      : {}),
    [exerciseLogProp("exerciseRelation")]: {
      relation: [{ id: input.exerciseId }],
    },
    [exerciseLogProp("trainingRecordRelation")]: {
      relation: [{ id: input.trainingLogId }],
    },
  };
}

/**
 * 種目ログ更新入力 → Notion プロパティペイロード。
 * name (連番) と種目リレーションは維持し、編集可能な rest / memo のみ置き換える。
 */
export function buildUpdateExerciseLogProperties(input: {
  rest: number | null;
  memo: string;
}): Record<string, unknown> {
  return {
    [exerciseLogProp("rest")]: { number: input.rest },
    [exerciseLogProp("memo")]: {
      rich_text: input.memo ? [{ text: { content: input.memo } }] : [],
    },
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
