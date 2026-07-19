import type { PaginatedResponse, ApiResponse } from "../index";

/**
 * TODOS DB の Status プロパティ（Notion 側の実値）
 */
export const TASK_STATUSES = ["To-do", "In progress", "Complete"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * TODOS DB の category プロパティ（Notion 側の実値）
 */
export const TASK_CATEGORIES = [
  "✅️ Task",
  "📥️ Inbox",
  "📅 Schedule",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

/**
 * TODOS DB の Working Time プロパティ（見積ポモドーロ数）
 * ラベルと個数の対応を持つ。
 */
export const WORKING_TIME_OPTIONS = [
  { label: "🍅", pomodoros: 1 },
  { label: "🍅🍅", pomodoros: 2 },
  { label: "🍎🍎🍎", pomodoros: 3 },
  { label: "🍎🍎🍎🍎", pomodoros: 4 },
] as const;
export type WorkingTimeLabel = (typeof WORKING_TIME_OPTIONS)[number]["label"];

/**
 * TODOS DB の Working hours プロパティ（時間帯）
 */
export const WORKING_HOURS_OPTIONS = [
  "5:00 - 12:00",
  "12:00 - 18:00",
  "18:00 - 23:00",
] as const;
export type WorkingHours = (typeof WORKING_HOURS_OPTIONS)[number];

/**
 * フロントで扱うタスク1件の表示モデル
 */
export type TaskItem = {
  id: string;
  name: string;
  status: TaskStatus | null;
  category: TaskCategory | null;
  /** 見積ポモドーロ数（Working Time から算出、未設定は null） */
  estimatedPomodoros: number | null;
  workingHours: WorkingHours | null;
  /** 予定日時（Schedule） */
  scheduledStart: string | null;
  scheduledEnd: string | null;
  /** 実測（start time / end time） */
  startTime: string | null;
  endTime: string | null;
  /** Actual work time（分, formula） */
  actualWorkMinutes: number | null;
  memo: string;
  /** 所属プロジェクトのページID（先頭1件） */
  projectId: string | null;
  createdTime: string | null;
  url: string;
};

export type TaskListResponse = PaginatedResponse<TaskItem>;
export type TaskDetailResponse = ApiResponse<TaskItem | null>;
