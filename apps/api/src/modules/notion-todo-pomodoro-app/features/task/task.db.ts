/**
 * TODOS DB の定義ファイル。
 * Notion の生プロパティ名と「ページ ⇔ ドメイン型」の変換を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  getTitle,
  getStatusName,
  getSelectName,
  getRichText,
  getDate,
  getFormula,
  getRelationIds,
  getCreatedTime,
} from "@/integrations/notion/notion.mapper";
import type { NotionTaskPage } from "./task.types";
import type {
  TaskItem,
  TaskStatus,
  TaskCategory,
  WorkingHours,
} from "@repo/types/notion-todo-pomodoro-app";
import { WORKING_TIME_OPTIONS } from "@repo/types/notion-todo-pomodoro-app";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@repo/schemas/notion-todo-pomodoro-app";

/** 論理名 → Notion 生プロパティ名 (" Working hours" は先頭スペース有り) */
export const TASK_PROPS = {
  name: "name",
  status: "Status",
  category: "category",
  workingTime: "Working Time",
  workingHours: " Working hours",
  schedule: "Schedule",
  startTime: "start time",
  endTime: "end time",
  actualWorkTime: "Actual work time",
  memo: "memo",
  project: "Project",
  createdTime: "作成日時",
} as const;

/** Working Time ラベル → 見積ポモドーロ数 */
function workingTimeLabelToPomodoros(label: string | null): number | null {
  if (!label) return null;
  const found = WORKING_TIME_OPTIONS.find((o) => o.label === label);
  return found ? found.pomodoros : null;
}

/** 見積ポモドーロ数 → Working Time ラベル */
function pomodorosToWorkingTimeLabel(pomodoros: number): string | null {
  const found = WORKING_TIME_OPTIONS.find((o) => o.pomodoros === pomodoros);
  return found ? found.label : null;
}

/** Notion ページ → フロント表示モデル */
export function mapTaskPage(page: NotionTaskPage): TaskItem {
  const p = page.properties;
  const schedule = getDate(p[TASK_PROPS.schedule]);
  const startTime = getDate(p[TASK_PROPS.startTime]);
  const endTime = getDate(p[TASK_PROPS.endTime]);

  return {
    id: page.id,
    name: getTitle(p[TASK_PROPS.name]),
    status: getStatusName(p[TASK_PROPS.status]) as TaskStatus | null,
    category: getSelectName(p[TASK_PROPS.category]) as TaskCategory | null,
    estimatedPomodoros: workingTimeLabelToPomodoros(
      getSelectName(p[TASK_PROPS.workingTime]),
    ),
    workingHours: getSelectName(
      p[TASK_PROPS.workingHours],
    ) as WorkingHours | null,
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    startTime: startTime?.start ?? null,
    endTime: endTime?.start ?? null,
    actualWorkMinutes: getFormula(p[TASK_PROPS.actualWorkTime], "number"),
    memo: getRichText(p[TASK_PROPS.memo]),
    projectId: getRelationIds(p[TASK_PROPS.project])[0] ?? null,
    createdTime: getCreatedTime(p[TASK_PROPS.createdTime]),
    url: page.url,
  };
}

/** タスク新規作成入力 → Notion プロパティペイロード */
export function buildCreateTaskProperties(
  input: CreateTaskInput,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    [TASK_PROPS.name]: { title: [{ text: { content: input.name } }] },
  };

  if (input.status) {
    properties[TASK_PROPS.status] = { status: { name: input.status } };
  }
  if (input.category) {
    properties[TASK_PROPS.category] = { select: { name: input.category } };
  }
  if (input.estimatedPomodoros) {
    const label = pomodorosToWorkingTimeLabel(input.estimatedPomodoros);
    if (label) properties[TASK_PROPS.workingTime] = { select: { name: label } };
  }
  if (input.workingHours) {
    properties[TASK_PROPS.workingHours] = {
      select: { name: input.workingHours },
    };
  }
  if (input.scheduledStart) {
    properties[TASK_PROPS.schedule] = {
      date: {
        start: input.scheduledStart,
        end: input.scheduledEnd ?? null,
      },
    };
  }
  if (input.projectId) {
    properties[TASK_PROPS.project] = { relation: [{ id: input.projectId }] };
  }
  if (input.memo) {
    properties[TASK_PROPS.memo] = {
      rich_text: [{ text: { content: input.memo } }],
    };
  }
  return properties;
}

/** タスク更新入力 → Notion プロパティペイロード */
export function buildUpdateTaskProperties(
  input: UpdateTaskInput,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  if (input.status) {
    properties[TASK_PROPS.status] = { status: { name: input.status } };
  }
  if (input.startTime !== undefined) {
    properties[TASK_PROPS.startTime] = {
      date: input.startTime ? { start: input.startTime } : null,
    };
  }
  if (input.endTime !== undefined) {
    properties[TASK_PROPS.endTime] = {
      date: input.endTime ? { start: input.endTime } : null,
    };
  }
  return properties;
}
