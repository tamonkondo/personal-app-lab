import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import {
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
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
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: PROJECTS_DB,
      page_size: params.limit ?? 50,
      start_cursor: params.cursor,
    }),
  );

  return {
    data: envelope.results.map(mapProjectPage),
    meta: toPaginationMeta(envelope),
  };
}
