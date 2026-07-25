import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import type { NotionProjectQueryResult } from "./project.types";
import type { ProjectItem } from "@repo/types/notion-todo-pomodoro-app";
import { mapProjectPage } from "./project.db";

const PROJECTS_DB = config.NOTION_PROJECTS_DB;

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
