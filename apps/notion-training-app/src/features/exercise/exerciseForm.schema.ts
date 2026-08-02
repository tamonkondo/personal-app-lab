/**
 * 種目マスタフォームの zod スキーマ (react-hook-form 用)。
 * フォーム値は input 由来の文字列 / Option[] のまま検証し、送信時に
 * API 入力 (@repo/schemas の Create/UpdateExerciseInput) へ変換する。
 */
import { z } from "zod";
import type { Option } from "@repo/ui";
import {
  EXERCISE_RM_TYPES,
  type ExerciseDetail,
} from "@repo/types/notion-training-app";
import type { CreateExerciseInput } from "@repo/schemas/notion-training-app";
import BODY_PARTS from "../../constants/parts";

/** 空文字 or 数値文字列のみ許可 */
const numericString = (message = "数値で入力してください") =>
  z
    .string()
    .refine(
      (value) => value.trim() === "" || !Number.isNaN(Number(value)),
      { message },
    );

export const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, "種目名を入力してください"),
  /** MultipleSelector の選択値 (value = Notion multi_select の値) */
  musclesTypes: z.array(z.custom<Option>()),
  rest: numericString(),
  /** "" は未設定 */
  rmType: z.union([z.enum(EXERCISE_RM_TYPES), z.literal("")]),
});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

export const emptyExerciseFormValues = (): ExerciseFormValues => ({
  name: "",
  musclesTypes: [],
  rest: "90",
  rmType: "",
});

/** 取得済みの種目詳細 → フォーム値 */
export function detailToExerciseFormValues(
  detail: ExerciseDetail,
): ExerciseFormValues {
  return {
    name: detail.exerciseName || detail.trainingName || "",
    musclesTypes: detail.musclesTypes.map(
      (part) =>
        BODY_PARTS.find(
          (bodyPart) => bodyPart.value === part || bodyPart.label === part,
        ) ?? { value: part, label: part },
    ),
    rest: detail.rest !== null ? String(detail.rest) : "",
    rmType: detail.rmTypes ?? "",
  };
}

/** フォーム値 → 作成/更新 API 入力 (両者は同じフィールド) */
export function toExerciseInput(
  values: ExerciseFormValues,
): CreateExerciseInput {
  return {
    name: values.name.trim(),
    musclesTypes: values.musclesTypes.map((option) => option.value),
    rmTypes: values.rmType === "" ? null : values.rmType,
    rest: values.rest.trim() === "" ? null : Number(values.rest),
  };
}
