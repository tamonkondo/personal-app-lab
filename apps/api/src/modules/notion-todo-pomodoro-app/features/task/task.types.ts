import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

/**
 * TODOS DB のプロパティ定義。
 * Notion 側の実プロパティ名に合わせている（" Working hours" は先頭スペース有り）。
 */
export type NotionTaskProperties = {
  name: NotionProp<"name", "title">;
  Status: NotionProp<"Status", "status">;
  category: NotionProp<"category", "select">;
  "Working Time": NotionProp<"Working Time", "select">;
  " Working hours": NotionProp<" Working hours", "select">;
  Schedule: NotionProp<"Schedule", "date">;
  "start time": NotionProp<"start time", "date">;
  "end time": NotionProp<"end time", "date">;
  "Actual work time": NotionProp<"Actual work time", "formula">;
  memo: NotionProp<"memo", "rich_text">;
  Project: NotionProp<"Project", "relation">;
  作成日時: NotionProp<"作成日時", "created_time">;
};

export type NotionTaskPage<
  T extends keyof NotionTaskProperties = keyof NotionTaskProperties,
> = BasePageMeta & {
  properties: Pick<NotionTaskProperties, T>;
};

export type NotionTaskQueryResult<
  T extends keyof NotionTaskProperties = keyof NotionTaskProperties,
> = NotionResults<NotionTaskPage<T>>;
