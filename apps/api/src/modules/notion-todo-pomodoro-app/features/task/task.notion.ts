import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import {
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
import type {
  TaskItem,
  TaskStatus,
  TaskCategory,
} from "@repo/types/notion-todo-pomodoro-app";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskScope,
} from "@repo/schemas/notion-todo-pomodoro-app";
import {
  TASK_PROPS,
  mapTaskPage,
  buildCreateTaskProperties,
  buildUpdateTaskProperties,
} from "./task.db";

const TODOS_DB = config.NOTION_TODOS_DB;

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
      property: TASK_PROPS.schedule,
      date: { on_or_after: start },
    });
    filters.push({
      property: TASK_PROPS.schedule,
      date: { before: end },
    });
  } else if (params.scope === "active") {
    filters.push({
      property: TASK_PROPS.status,
      status: { does_not_equal: "Complete" },
    });
  }

  if (params.status) {
    filters.push({
      property: TASK_PROPS.status,
      status: { equals: params.status },
    });
  }
  if (params.category) {
    filters.push({
      property: TASK_PROPS.category,
      select: { equals: params.category },
    });
  }
  if (params.projectId) {
    filters.push({
      property: TASK_PROPS.project,
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
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: TODOS_DB,
      ...(filter ? { filter: filter as never } : {}),
      sorts: [{ property: TASK_PROPS.schedule, direction: "ascending" }],
      page_size: params.limit ?? 20,
      start_cursor: params.cursor,
    }),
  );

  return {
    data: envelope.results.map(mapTaskPage),
    meta: toPaginationMeta(envelope),
  };
}

export async function fetchTaskById(id: string): Promise<TaskItem> {
  return mapTaskPage(await notionClient.pages.retrieve({ page_id: id }));
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  return mapTaskPage(
    await notionClient.pages.create({
      parent: { data_source_id: TODOS_DB },
      properties: buildCreateTaskProperties(input) as never,
    }),
  );
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<TaskItem> {
  return mapTaskPage(
    await notionClient.pages.update({
      page_id: id,
      properties: buildUpdateTaskProperties(input) as never,
    }),
  );
}
