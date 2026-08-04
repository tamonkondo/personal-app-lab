/**
 * トレーニング記録フォームの zod スキーマ (react-hook-form 用)。
 * フォーム値は input 由来の文字列のまま検証し、送信時に
 * API 入力 (@repo/schemas の Create/UpdateTrainingLogInput) へ変換する。
 */
import { z } from "zod";
import type {
  CreateTrainingLogInput,
  UpdateTrainingLogInput,
} from "@repo/schemas/notion-training-app";
import type { TrainingLogDetail } from "@repo/types/notion-training-app";

/** 空文字 or 数値文字列のみ許可 */
const numericString = (message = "数値で入力してください") =>
  z
    .string()
    .refine(
      (value) => value.trim() === "" || !Number.isNaN(Number(value)),
      { message },
    );

export const exerciseSetFieldSchema = z.object({
  /** 既存セットの Notion ページ ID (新規は null) */
  setId: z.string().nullable(),
  kg: numericString(),
  rep: numericString(),
  memo: z.string(),
});

export type ExerciseSetFieldValues = z.infer<typeof exerciseSetFieldSchema>;

/** kg / rep の両方が空のセットは未入力扱い (送信対象から外す) */
export const isFilledSet = (set: { kg: string; rep: string }) =>
  set.kg.trim() !== "" || set.rep.trim() !== "";

export const exerciseFieldSchema = z.object({
  /** 既存の種目ログの Notion ページ ID (新規は null) */
  logId: z.string().nullable(),
  exerciseId: z.string().min(1, "種目を選択してください"),
  exerciseName: z.string(),
  rest: numericString(),
  memo: z.string(),
  sets: z.array(exerciseSetFieldSchema).min(1),
});

export type ExerciseFieldValues = z.infer<typeof exerciseFieldSchema>;

/** 種目ダイアログの保存時検証: 入力済みセットが1つ以上必要 */
export const exerciseDraftSchema = exerciseFieldSchema.refine(
  (exercise) => exercise.sets.some(isFilledSet),
  { message: "セットを1つ以上入力してください", path: ["sets", "root"] },
);

/** ローカルタイムゾーンの当日 (YYYY-MM-DD) */
export const todayDateString = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const trainingLogFormSchema = z.object({
  /** 記録日 (YYYY-MM-DD)。未来日は不可 (編集時は表示のみで送信しない) */
  date: z
    .string()
    .min(1, "日付を入力してください")
    .refine((value) => value <= todayDateString(), {
      message: "未来の日付は選択できません",
    }),
  bodyWeight: numericString(),
  memo: z.string(),
  exercises: z
    .array(
      exerciseFieldSchema.refine(
        (exercise) => exercise.sets.some(isFilledSet),
        { message: "セットを1つ以上入力してください", path: ["sets", "root"] },
      ),
    )
    .min(1, "種目を1つ以上追加してください"),
});

export type TrainingLogFormValues = z.infer<typeof trainingLogFormSchema>;

export const emptySetValues = (): ExerciseSetFieldValues => ({
  setId: null,
  kg: "",
  rep: "",
  memo: "",
});

export const emptyExerciseValues = (): ExerciseFieldValues => ({
  logId: null,
  exerciseId: "",
  exerciseName: "",
  rest: "90",
  memo: "",
  sets: [emptySetValues()],
});

export const emptyTrainingLogFormValues = (): TrainingLogFormValues => ({
  date: todayDateString(),
  bodyWeight: "",
  memo: "",
  exercises: [],
});

/**
 * 取得済みの詳細 → フォーム値。
 * asTemplate: true なら logId / setId とメモを持たせない
 * (「同じ内容で記録作成」用。送信するとすべて新規作成になる)
 */
export function detailToFormValues(
  detail: TrainingLogDetail,
  options?: { asTemplate?: boolean },
): TrainingLogFormValues {
  const asTemplate = options?.asTemplate ?? false;
  return {
    // テンプレート利用時は新規記録なので当日。編集時は既存の記録日 (表示のみ)
    date: asTemplate ? todayDateString() : detail.createdTime.slice(0, 10),
    bodyWeight: detail.bodyWeight ? String(detail.bodyWeight) : "",
    memo: asTemplate ? "" : (detail.memo ?? ""),
    exercises: detail.exercises.map((exercise) => ({
      logId: asTemplate ? null : exercise.exerciseSets.exerciseLogId,
      exerciseId: exercise.exerciseSets.exerciseId,
      exerciseName: exercise.trainingName,
      rest: exercise.exerciseSets.rest
        ? String(exercise.exerciseSets.rest)
        : "",
      memo: asTemplate ? "" : (exercise.memo ?? ""),
      sets:
        exercise.exerciseSets.sets.length > 0
          ? exercise.exerciseSets.sets.map((set) => ({
              setId: asTemplate ? null : set.id || null,
              kg: set.kg ? String(set.kg) : "",
              rep: set.rep ? String(set.rep) : "",
              memo: asTemplate ? "" : (set.memo ?? ""),
            }))
          : [emptySetValues()],
    })),
  };
}

/** フォーム値 → 作成 API 入力 (未入力セットは除外) */
export function toCreateTrainingLogInput(
  values: TrainingLogFormValues,
): CreateTrainingLogInput {
  return {
    date: values.date,
    bodyWeight:
      values.bodyWeight.trim() === "" ? null : Number(values.bodyWeight),
    memo: values.memo,
    exercises: values.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      rest: exercise.rest.trim() === "" ? null : Number(exercise.rest),
      memo: exercise.memo,
      sets: exercise.sets.filter(isFilledSet).map((set) => ({
        kg: Number(set.kg) || 0,
        rep: Number(set.rep) || 0,
        memo: set.memo,
      })),
    })),
  };
}

/** フォーム値 → 更新 API 入力 (既存要素は logId / setId を付与) */
export function toUpdateTrainingLogInput(
  values: TrainingLogFormValues,
): UpdateTrainingLogInput {
  return {
    bodyWeight:
      values.bodyWeight.trim() === "" ? null : Number(values.bodyWeight),
    memo: values.memo,
    exercises: values.exercises.map((exercise) => ({
      ...(exercise.logId ? { logId: exercise.logId } : {}),
      exerciseId: exercise.exerciseId,
      rest: exercise.rest.trim() === "" ? null : Number(exercise.rest),
      memo: exercise.memo,
      sets: exercise.sets.filter(isFilledSet).map((set) => ({
        ...(set.setId ? { setId: set.setId } : {}),
        kg: Number(set.kg) || 0,
        rep: Number(set.rep) || 0,
        memo: set.memo,
      })),
    })),
  };
}
