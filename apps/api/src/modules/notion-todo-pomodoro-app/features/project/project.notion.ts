import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import {
  getTitle,
  getStatusName,
  getSelectName,
  getRichText,
  getMultiSelectNames,
  getDate,
  getRelationIds,
} from "@/integrations/notion/notion.mapper";
import type {
  NotionProjectPage,
  NotionProjectQueryResult,
} from "./project.types";
import type {
  ProjectItem,
  ProjectStatus,
  ProjectCategory,
} from "@repo/types/notion-todo-pomodoro-app";

const PROJECTS_DB = config.NOTION_PROJECTS_DB;

export function mapProjectPage(page: NotionProjectPage): ProjectItem {
  const p = page.properties;
  const schedule = getDate(p.Schedule);
  return {
    id: page.id,
    name: getTitle(p.Name),
    goal: getRichText(p.Goal),
    status: getStatusName(p.status) as ProjectStatus | null,
    category: getSelectName(p.Category) as ProjectCategory | null,
    kinds: getMultiSelectNames(p.kinds),
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    memo: getRichText(p.memo),
    taskIds: getRelationIds(p.Tasks),
    url: page.url,
  };
}

export async function fetchProjects(params: {
  limit?: number;
  cursor?: string;
}): Promise<{
  data: ProjectItem[];
  meta: { has_more: boolean; next_cursor?: string };
}> {
  const res = (await notionClient.dataSources.query({
    data_source_id: PROJECTS_DB,
    page_size: params.limit ?? 50,
    start_cursor: params.cursor,
  })) as unknown as NotionProjectQueryResult;

  return {
    data: res.results.map(mapProjectPage),
    meta: {
      has_more: res.has_more,
      next_cursor: res.next_cursor || undefined,
    },
  };
}
