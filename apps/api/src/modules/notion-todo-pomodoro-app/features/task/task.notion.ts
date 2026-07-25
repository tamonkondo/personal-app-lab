import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
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
import type { NotionTaskPage, NotionTaskQueryResult } from "./task.types";
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
  TaskScope,
} from "@repo/schemas/notion-todo-pomodoro-app";

const TODOS_DB = config.NOTION_TODOS_DB;

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
  const schedule = getDate(p["Schedule"]);
  const startTime = getDate(p["start time"]);
  const endTime = getDate(p["end time"]);

  return {
    id: page.id,
    name: getTitle(p.name),
    status: getStatusName(p.Status) as TaskStatus | null,
    category: getSelectName(p.category) as TaskCategory | null,
    estimatedPomodoros: workingTimeLabelToPomodoros(
      getSelectName(p["Working Time"]),
    ),
    workingHours: getSelectName(p[" Working hours"]) as WorkingHours | null,
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    startTime: startTime?.start ?? null,
    endTime: endTime?.start ?? null,
    actualWorkMinutes: getFormula(p["Actual work time"], "number"),
    memo: getRichText(p.memo),
    projectId: getRelationIds(p.Project)[0] ?? null,
    createdTime: getCreatedTime(p["作成日時"]),
    url: page.url,
  };
}

type TaskFilter =
  | { property: string; [key: string]: unknown }
  | { and: TaskFilter[] }
  | { or: TaskFilter[] };

/** サーバのローカルタイムでの今日の 00:00 / 翌日 00:00 を ISO で返す */
function todayBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function buildFilter(params: {
  scope: TaskScope;
  status?: TaskStatus | null;
  category?: TaskCategory | null;
  projectId?: string | null;
}): TaskFilter | undefined {
  const filters: TaskFilter[] = [];

  if (params.scope === "today") {
    const { start, end } = todayBounds();
    filters.push({
      property: "Schedule",
      date: { on_or_after: start },
    });
    filters.push({
      property: "Schedule",
      date: { before: end },
    });
  } else if (params.scope === "active") {
    filters.push({
      property: "Status",
      status: { does_not_equal: "Complete" },
    });
  }

  if (params.status) {
    filters.push({
      property: "Status",
      status: { equals: params.status },
    });
  }
  if (params.category) {
    filters.push({
      property: "category",
      select: { equals: params.category },
    });
  }
  if (params.projectId) {
    filters.push({
      property: "Project",
      relation: { contains: params.projectId },
    });
  }

  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return { and: filters };
}

export type FetchTasksParams = {
  scope: TaskScope;
  status?: TaskStatus | null;
  category?: TaskCategory | null;
  projectId?: string | null;
  limit?: number;
  cursor?: string;
};

export async function fetchTasks(params: FetchTasksParams): Promise<{
  data: TaskItem[];
  meta: { has_more: boolean; next_cursor?: string };
}> {
  const filter = buildFilter(params);
  const res = (await notionClient.dataSources.query({
    data_source_id: TODOS_DB,
    ...(filter ? { filter: filter as never } : {}),
    sorts: [{ property: "Schedule", direction: "ascending" }],
    page_size: params.limit ?? 20,
    start_cursor: params.cursor,
  })) as unknown as NotionTaskQueryResult;

  return {
    data: res.results.map(mapTaskPage),
    meta: {
      has_more: res.has_more,
      next_cursor: res.next_cursor || undefined,
    },
  };
}

export async function fetchTaskById(id: string): Promise<TaskItem> {
  const page = (await notionClient.pages.retrieve({
    page_id: id,
  })) as unknown as NotionTaskPage;
  return mapTaskPage(page);
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  const properties: Record<string, unknown> = {
    name: { title: [{ text: { content: input.name } }] },
  };

  if (input.status) properties.Status = { status: { name: input.status } };
  if (input.category) properties.category = { select: { name: input.category } };
  if (input.estimatedPomodoros) {
    const label = pomodorosToWorkingTimeLabel(input.estimatedPomodoros);
    if (label) properties["Working Time"] = { select: { name: label } };
  }
  if (input.workingHours) {
    properties[" Working hours"] = { select: { name: input.workingHours } };
  }
  if (input.scheduledStart) {
    properties.Schedule = {
      date: {
        start: input.scheduledStart,
        end: input.scheduledEnd ?? null,
      },
    };
  }
  if (input.projectId) {
    properties.Project = { relation: [{ id: input.projectId }] };
  }
  if (input.memo) {
    properties.memo = { rich_text: [{ text: { content: input.memo } }] };
  }

  const page = (await notionClient.pages.create({
    parent: { data_source_id: TODOS_DB },
    properties: properties as never,
  })) as unknown as NotionTaskPage;
  return mapTaskPage(page);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<TaskItem> {
  const properties: Record<string, unknown> = {};

  if (input.status) properties.Status = { status: { name: input.status } };
  if (input.startTime !== undefined) {
    properties["start time"] = {
      date: input.startTime ? { start: input.startTime } : null,
    };
  }
  if (input.endTime !== undefined) {
    properties["end time"] = {
      date: input.endTime ? { start: input.endTime } : null,
    };
  }

  const page = (await notionClient.pages.update({
    page_id: id,
    properties: properties as never,
  })) as unknown as NotionTaskPage;
  return mapTaskPage(page);
}
