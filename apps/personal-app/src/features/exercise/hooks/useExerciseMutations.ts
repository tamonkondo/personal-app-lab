import { useState } from "react";
import { useSWRConfig } from "swr";
import type {
  CreateExerciseResponse,
  CreateExerciseResult,
  DeleteExerciseResponse,
  UpdateExerciseResponse,
  UpdateExerciseResult,
} from "@repo/types/notion-training-app";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from "@repo/schemas/notion-training-app";
import { API_BASE, mutateJson } from "../../../lib/fetch";

const EXERCISE_KEY_PREFIX = `${API_BASE}/exercise`;

/**
 * 種目マスタのミューテーション。
 * 作成/更新/削除後は exercise 系の SWR キャッシュ (names/summary/詳細/トレンド) を
 * まとめて再検証する。
 */
export function useExerciseMutations() {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revalidateExercises = () =>
    mutate(
      (key) => typeof key === "string" && key.startsWith(EXERCISE_KEY_PREFIX),
    );

  const createExercise = async (
    input: CreateExerciseInput,
  ): Promise<CreateExerciseResult> => {
    setIsSubmitting(true);
    try {
      const response = await mutateJson<CreateExerciseResponse>(
        EXERCISE_KEY_PREFIX,
        "POST",
        input,
      );
      await revalidateExercises();
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExercise = async (
    id: string,
    input: UpdateExerciseInput,
  ): Promise<UpdateExerciseResult> => {
    setIsSubmitting(true);
    try {
      const response = await mutateJson<UpdateExerciseResponse>(
        `${EXERCISE_KEY_PREFIX}/${id}`,
        "PATCH",
        input,
      );
      await revalidateExercises();
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExercise = async (id: string): Promise<void> => {
    setIsSubmitting(true);
    try {
      await mutateJson<DeleteExerciseResponse>(
        `${EXERCISE_KEY_PREFIX}/${id}`,
        "DELETE",
      );
      await revalidateExercises();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createExercise, updateExercise, deleteExercise, isSubmitting };
}
