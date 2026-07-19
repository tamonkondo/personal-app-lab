import { z } from "zod";
import {
  TASK_STATUSES,
  TASK_CATEGORIES,
  WORKING_HOURS_OPTIONS,
} from "@repo/types/notion-todo-pomodoro-app";

/**
 * タスク新規作成の入力
 */
export const createTaskSchema = z.object({
  name: z.string().min(1),
  status: z.enum(TASK_STATUSES).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  /** 見積ポモドーロ数（1〜4）。Working Time にマッピングされる */
  estimatedPomodoros: z.number().int().min(1).max(4).optional(),
  workingHours: z.enum(WORKING_HOURS_OPTIONS).optional(),
  projectId: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  memo: z.string().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * タスク更新の入力（Status / start time / end time の書き戻し）
 * すべて任意。渡されたフィールドだけを更新する。
 */
export const updateTaskSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * タスク一覧の絞り込み（フロントの URL クエリ）
 */
export const TASK_SCOPES = ["today", "active", "all"] as const;
export type TaskScope = (typeof TASK_SCOPES)[number];

export const taskListParamsSchema = z.object({
  scope: z.enum(TASK_SCOPES).catch("active"),
  status: z.enum(TASK_STATUSES).nullable().catch(null),
  category: z.enum(TASK_CATEGORIES).nullable().catch(null),
  projectId: z.string().nullable().catch(null),
});
export type TaskListParams = z.infer<typeof taskListParamsSchema>;
