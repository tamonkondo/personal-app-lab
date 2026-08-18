/**
 * タスククイック追加フォームの zod スキーマ (react-hook-form 用)。
 * フォーム値は input 由来の値のまま検証し、送信時に
 * API 入力 (@repo/schemas の CreateTaskInput) へ変換する。
 */
import { z } from "zod";
import {
  TASK_CATEGORIES,
  WORKING_HOURS_OPTIONS,
} from "@repo/types/notion-todo-pomodoro-app";
import type { CreateTaskInput } from "@repo/schemas/notion-todo-pomodoro-app";
import { currentWorkingHours } from "./lib/workingHours";

export const taskFormSchema = z.object({
  name: z.string().trim().min(1, "タスク名を入力してください"),
  category: z.enum(TASK_CATEGORIES),
  /** 見積ポモドーロ数（1〜4） */
  pomodoros: z.number().int().min(1).max(4),
  /** "" は未設定 */
  workingHours: z.union([z.enum(WORKING_HOURS_OPTIONS), z.literal("")]),
  /** "" はプロジェクトなし */
  projectId: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** 既定値。時間帯は現在時刻の時間帯（範囲外なら未設定） */
export const defaultTaskFormValues = (
  defaultProjectId?: string,
): TaskFormValues => ({
  name: "",
  category: "✅️ Task",
  pomodoros: 1,
  workingHours: currentWorkingHours() ?? "",
  projectId: defaultProjectId ?? "",
});

/** フォーム値 → 作成 API 入力（予定日は呼び出し側で付与する） */
export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  return {
    name: values.name.trim(),
    category: values.category,
    status: "To-do",
    estimatedPomodoros: values.pomodoros,
    workingHours: values.workingHours === "" ? undefined : values.workingHours,
    projectId: values.projectId === "" ? undefined : values.projectId,
  };
}
