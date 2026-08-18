import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { mutateJson, TODO_API_BASE } from "../../../lib/fetch";
import { TASKS_KEY_PREFIX } from "./useTasks";
import type { TaskItem } from "@repo/types/notion-todo-pomodoro-app";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@repo/schemas/notion-todo-pomodoro-app";

type TaskMutationResponse = { message: string; data: TaskItem };

export function useTaskMutations() {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tasks 一覧のキャッシュをすべて再検証する
  const revalidateTasks = useCallback(() => {
    return mutate(
      (key) => typeof key === "string" && key.startsWith(TASKS_KEY_PREFIX),
      undefined,
      { revalidate: true },
    );
  }, [mutate]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setIsSubmitting(true);
      try {
        const res = await mutateJson<TaskMutationResponse>(
          `${TODO_API_BASE}/tasks`,
          "POST",
          input,
        );
        await revalidateTasks();
        return res.data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidateTasks],
  );

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      setIsSubmitting(true);
      try {
        const res = await mutateJson<TaskMutationResponse>(
          `${TODO_API_BASE}/tasks/${id}`,
          "PATCH",
          input,
        );
        await revalidateTasks();
        return res.data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [revalidateTasks],
  );

  return { createTask, updateTask, isSubmitting };
}
