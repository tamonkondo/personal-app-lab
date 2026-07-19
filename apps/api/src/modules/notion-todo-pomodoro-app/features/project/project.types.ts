import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

/**
 * PROJECTS DB のプロパティ定義（利用するものだけ）。
 */
export type NotionProjectProperties = {
  Name: NotionProp<"Name", "title">;
  Goal: NotionProp<"Goal", "rich_text">;
  status: NotionProp<"status", "status">;
  Category: NotionProp<"Category", "select">;
  kinds: NotionProp<"kinds", "multi_select">;
  Schedule: NotionProp<"Schedule", "date">;
  memo: NotionProp<"memo", "rich_text">;
  Tasks: NotionProp<"Tasks", "relation">;
};

export type NotionProjectPage<
  T extends keyof NotionProjectProperties = keyof NotionProjectProperties,
> = BasePageMeta & {
  properties: Pick<NotionProjectProperties, T>;
};

export type NotionProjectQueryResult<
  T extends keyof NotionProjectProperties = keyof NotionProjectProperties,
> = NotionResults<NotionProjectPage<T>>;
