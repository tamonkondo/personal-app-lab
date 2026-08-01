/**
 * EXERCISE_SETS DB の定義ファイル (書き込みペイロード)。
 * Notion の生プロパティ名を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { notionPropOf } from "@/libs/notion/propertyExtract";
import type { NotionExerciseSetWeightProperties } from "./exerciseSet.types";

export const exerciseSetProp = notionPropOf<NotionExerciseSetWeightProperties>();

/**
 * セット作成入力 → Notion プロパティペイロード。
 * name は既存規則 "<連番>__<YYYYMMDD>__<種目名>" に合わせる。
 */
export function buildCreateExerciseSetProperties(input: {
  setNumber: number;
  dateKey: string; // YYYYMMDD
  exerciseName: string;
  kg: number;
  rep: number;
  memo: string;
  exerciseLogId: string;
}): Record<string, unknown> {
  return {
    [exerciseSetProp("name")]: {
      title: [
        {
          text: {
            content: `${input.setNumber}__${input.dateKey}__${input.exerciseName}`,
          },
        },
      ],
    },
    [exerciseSetProp("kg")]: { number: input.kg },
    [exerciseSetProp("rep")]: { number: input.rep },
    ...(input.memo
      ? {
          [exerciseSetProp("memo")]: {
            rich_text: [{ text: { content: input.memo } }],
          },
        }
      : {}),
    // 双方向リレーションのため、セット側から張れば種目ログ側の exerciseSetsRelation にも自動反映される
    [exerciseSetProp("exerciseLogsRelation")]: {
      relation: [{ id: input.exerciseLogId }],
    },
  };
}

/**
 * セット更新入力 → Notion プロパティペイロード。
 * name とリレーションは維持し、編集可能な kg / rep / memo のみ置き換える。
 */
export function buildUpdateExerciseSetProperties(input: {
  kg: number;
  rep: number;
  memo: string;
}): Record<string, unknown> {
  return {
    [exerciseSetProp("kg")]: { number: input.kg },
    [exerciseSetProp("rep")]: { number: input.rep },
    [exerciseSetProp("memo")]: {
      rich_text: input.memo ? [{ text: { content: input.memo } }] : [],
    },
  };
}
