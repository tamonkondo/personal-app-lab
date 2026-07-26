import { useMemo, useState } from "react";
import type { CreateTrainingLogInput } from "@repo/schemas/notion-training-app";

export type ExerciseSetDraft = {
  id: string;
  kg: string;
  rep: string;
  memo: string;
};

export type TrainingExerciseDraft = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  rest: string;
  memo: string;
  sets: ExerciseSetDraft[];
};

const createSetDraft = (): ExerciseSetDraft => ({
  id: crypto.randomUUID(),
  kg: "",
  rep: "",
  memo: "",
});

const createExerciseDraft = (): TrainingExerciseDraft => ({
  id: crypto.randomUUID(),
  exerciseId: "",
  exerciseName: "",
  rest: "90",
  memo: "",
  sets: [createSetDraft()],
});

export const getMaxWeight = (sets: ExerciseSetDraft[]) => {
  const weights = sets
    .map((set) => Number(set.kg))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  return weights.length > 0 ? Math.max(...weights) : null;
};

export const getCompletedSetCount = (sets: ExerciseSetDraft[]) =>
  sets.filter((set) => Number(set.kg) > 0 || Number(set.rep) > 0).length;

/** kg / rep の両方が空のセットは未入力扱いで送信対象から外す */
const toFilledSets = (sets: ExerciseSetDraft[]) =>
  sets.filter((set) => set.kg.trim() !== "" || set.rep.trim() !== "");

/**
 * トレーニング記録 作成フォームの状態管理。
 * (日付は「当日記録のみ」の運用のため入力を持たない)
 */
export function useTrainingLogForm() {
  const [bodyWeight, setBodyWeight] = useState("");
  const [memo, setMemo] = useState("");
  const [exercises, setExercises] = useState<TrainingExerciseDraft[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exerciseDraft, setExerciseDraft] = useState(createExerciseDraft);

  const totalSets = useMemo(
    () =>
      exercises.reduce(
        (total, exercise) => total + getCompletedSetCount(exercise.sets),
        0,
      ),
    [exercises],
  );

  const maxWeightExerciseCount = useMemo(
    () =>
      exercises.filter((exercise) => getMaxWeight(exercise.sets) !== null)
        .length,
    [exercises],
  );

  const openNewExerciseDialog = () => {
    setEditingId(null);
    setExerciseDraft(createExerciseDraft());
    setDialogOpen(true);
  };

  const openEditExerciseDialog = (exercise: TrainingExerciseDraft) => {
    setEditingId(exercise.id);
    setExerciseDraft({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    });
    setDialogOpen(true);
  };

  const saveExerciseDraft = () => {
    if (!exerciseDraft.exerciseId) return;

    if (editingId) {
      setExercises((current) =>
        current.map((exercise) =>
          exercise.id === editingId ? exerciseDraft : exercise,
        ),
      );
    } else {
      setExercises((current) => [...current, exerciseDraft]);
    }

    setDialogOpen(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((current) =>
      current.filter((item) => item.id !== exerciseId),
    );
  };

  const updateDraftSet = (
    setId: string,
    field: keyof Omit<ExerciseSetDraft, "id">,
    value: string,
  ) => {
    setExerciseDraft((current) => ({
      ...current,
      sets: current.sets.map((set) =>
        set.id === setId ? { ...set, [field]: value } : set,
      ),
    }));
  };

  const addDraftSet = () => {
    setExerciseDraft((current) => ({
      ...current,
      sets: [...current.sets, createSetDraft()],
    }));
  };

  const removeDraftSet = (setId: string) => {
    setExerciseDraft((current) => ({
      ...current,
      sets: current.sets.filter((item) => item.id !== setId),
    }));
  };

  const canSubmit =
    exercises.length > 0 &&
    exercises.every((exercise) => toFilledSets(exercise.sets).length > 0);

  /** API 入力へ変換。送信できない状態なら null */
  const buildPayload = (): CreateTrainingLogInput | null => {
    if (!canSubmit) return null;
    return {
      bodyWeight: bodyWeight.trim() === "" ? null : Number(bodyWeight),
      memo,
      exercises: exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        rest: exercise.rest.trim() === "" ? null : Number(exercise.rest),
        memo: exercise.memo,
        sets: toFilledSets(exercise.sets).map((set) => ({
          kg: Number(set.kg) || 0,
          rep: Number(set.rep) || 0,
          memo: set.memo,
        })),
      })),
    };
  };

  return {
    bodyWeight,
    setBodyWeight,
    memo,
    setMemo,
    exercises,
    totalSets,
    maxWeightExerciseCount,
    dialogOpen,
    setDialogOpen,
    editingId,
    exerciseDraft,
    setExerciseDraft,
    openNewExerciseDialog,
    openEditExerciseDialog,
    saveExerciseDraft,
    removeExercise,
    updateDraftSet,
    addDraftSet,
    removeDraftSet,
    canSubmit,
    buildPayload,
  };
}

export type TrainingLogFormState = ReturnType<typeof useTrainingLogForm>;
