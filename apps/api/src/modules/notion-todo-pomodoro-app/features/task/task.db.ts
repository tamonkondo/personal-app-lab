/**
 * TODOS DB の定義ファイル。
 * Notion の生プロパティ名と「ページ ⇔ ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { z } from "zod";
import {
  notionTitle,
  notionStatus,
  notionSelect,
  notionRichText,
  notionDate,
  notionRelation,
  notionCreatedTime,
  notionFormulaNumber,
  notionPage,
} from "@/integrations/notion/notion.schema";
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

/** タスクページのスキーマ (パースと同時にドメイン値へ変換) */
const taskPageSchema = notionPage({
  [TASK_PROPS.name]: notionTitle(),
  [TASK_PROPS.status]: notionStatus(),
  [TASK_PROPS.category]: notionSelect(),
  [TASK_PROPS.workingTime]: notionSelect(),
  [TASK_PROPS.workingHours]: notionSelect(),
  [TASK_PROPS.schedule]: notionDate(),
  [TASK_PROPS.startTime]: notionDate(),
  [TASK_PROPS.endTime]: notionDate(),
  [TASK_PROPS.actualWorkTime]: notionFormulaNumber(),
  [TASK_PROPS.memo]: notionRichText(),
  [TASK_PROPS.project]: notionRelation(),
  [TASK_PROPS.createdTime]: notionCreatedTime(),
});

export type TaskPage = z.infer<typeof taskPageSchema>;

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

/** 生の Notion ページ (unknown) → フロント表示モデル */
export function mapTaskPage(raw: unknown): TaskItem {
  const page = taskPageSchema.parse(raw);
  const p = page.properties;
  const schedule = p[TASK_PROPS.schedule];
  const startTime = p[TASK_PROPS.startTime];
  const endTime = p[TASK_PROPS.endTime];

  return {
    id: page.id,
    name: p[TASK_PROPS.name],
    status: p[TASK_PROPS.status] as TaskStatus | null,
    category: p[TASK_PROPS.category] as TaskCategory | null,
    estimatedPomodoros: workingTimeLabelToPomodoros(p[TASK_PROPS.workingTime]),
    workingHours: p[TASK_PROPS.workingHours] as WorkingHours | null,
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    startTime: startTime?.start ?? null,
    endTime: endTime?.start ?? null,
    actualWorkMinutes: p[TASK_PROPS.actualWorkTime],
    memo: p[TASK_PROPS.memo],
    projectId: p[TASK_PROPS.project][0] ?? null,
    createdTime: p[TASK_PROPS.createdTime],
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
