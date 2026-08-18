import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TrainingLogDetail } from "@repo/types/notion-training-app";
import {
  emptyExerciseValues,
  emptySetValues,
  emptyTrainingLogFormValues,
  exerciseDraftSchema,
  detailToFormValues,
  trainingLogFormSchema,
  isFilledSet,
  type ExerciseFieldValues,
  type TrainingLogFormValues,
} from "../trainingLogForm.schema";

/** セット配列 → 最大重量 (未入力のみなら null) */
export const getMaxWeight = (sets: { kg: string }[]) => {
  const weights = sets
    .map((set) => Number(set.kg))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  return weights.length > 0 ? Math.max(...weights) : null;
};

/** 入力済みセット数 */
export const getCompletedSetCount = (sets: { kg: string; rep: string }[]) =>
  sets.filter(isFilledSet).length;

/**
 * トレーニング記録 作成/編集フォームの状態管理 (react-hook-form + zod)。
 * - メインフォーム: 体重 / メモ / 種目リスト (useFieldArray)
 * - 種目ダイアログ: 独立したサブフォーム。保存時に zod 検証し、
 *   メインフォームの field array へ append / update する
 */
export function useTrainingLogForm() {
  const form = useForm<TrainingLogFormValues>({
    resolver: zodResolver(trainingLogFormSchema),
    defaultValues: emptyTrainingLogFormValues(),
    mode: "onChange",
  });
  const exercisesArray = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  // 種目ダイアログのサブフォーム (キャンセルでメインに影響しない)
  const draftForm = useForm<ExerciseFieldValues>({
    resolver: zodResolver(exerciseDraftSchema),
    defaultValues: emptyExerciseValues(),
    mode: "onChange",
  });
  const draftSets = useFieldArray({
    control: draftForm.control,
    name: "sets",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const openNewExerciseDialog = () => {
    setEditingIndex(null);
    draftForm.reset(emptyExerciseValues());
    setDialogOpen(true);
  };

  const openEditExerciseDialog = (index: number) => {
    setEditingIndex(index);
    draftForm.reset(structuredClone(form.getValues(`exercises.${index}`)));
    setDialogOpen(true);
  };

  /** ダイアログの内容を検証してメインフォームへ反映 */
  const saveExerciseDraft = draftForm.handleSubmit((values) => {
    if (editingIndex !== null) {
      exercisesArray.update(editingIndex, values);
    } else {
      exercisesArray.append(values);
    }
    setDialogOpen(false);
  });

  const removeExercise = (index: number) => {
    exercisesArray.remove(index);
  };

  const addDraftSet = () => {
    draftSets.append(emptySetValues());
  };

  const removeDraftSet = (index: number) => {
    draftSets.remove(index);
  };

  /**
   * 取得済みの詳細でフォームを初期化。
   * asTemplate: true なら logId / setId を持たせない (「同じ内容で記録作成」用)
   */
  const hydrate = (
    detail: TrainingLogDetail,
    options?: { asTemplate?: boolean },
  ) => {
    form.reset(detailToFormValues(detail, options));
  };

  /** 種目を1つプリセットして開始 (「この種目で記録作成」用) */
  const addExercisePreset = (preset: {
    exerciseId: string;
    exerciseName: string;
  }) => {
    exercisesArray.append({
      ...emptyExerciseValues(),
      exerciseId: preset.exerciseId,
      exerciseName: preset.exerciseName,
    });
  };

  return {
    form,
    exercisesArray,
    draftForm,
    draftSets,
    dialogOpen,
    setDialogOpen,
    editingIndex,
    openNewExerciseDialog,
    openEditExerciseDialog,
    saveExerciseDraft,
    removeExercise,
    addDraftSet,
    removeDraftSet,
    hydrate,
    addExercisePreset,
  };
}

export type TrainingLogFormState = ReturnType<typeof useTrainingLogForm>;
