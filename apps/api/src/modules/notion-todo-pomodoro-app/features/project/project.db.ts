/**
 * PROJECTS DB の定義ファイル。
 * Notion の生プロパティ名と「ページ → ドメイン型」の変換を知る唯一の場所。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import {
  getTitle,
  getStatusName,
  getSelectName,
  getRichText,
  getMultiSelectNames,
  getDate,
  getRelationIds,
} from "@/integrations/notion/notion.mapper";
import type { NotionProjectPage } from "./project.types";
import type {
  ProjectItem,
  ProjectStatus,
  ProjectCategory,
} from "@repo/types/notion-todo-pomodoro-app";

/** 論理名 → Notion 生プロパティ名 */
export const PROJECT_PROPS = {
  name: "Name",
  goal: "Goal",
  status: "status",
  category: "Category",
  kinds: "kinds",
  schedule: "Schedule",
  memo: "memo",
  tasks: "Tasks",
} as const;

/** Notion ページ → フロント表示モデル */
export function mapProjectPage(page: NotionProjectPage): ProjectItem {
  const p = page.properties;
  const schedule = getDate(p[PROJECT_PROPS.schedule]);
  return {
    id: page.id,
    name: getTitle(p[PROJECT_PROPS.name]),
    goal: getRichText(p[PROJECT_PROPS.goal]),
    status: getStatusName(p[PROJECT_PROPS.status]) as ProjectStatus | null,
    category: getSelectName(
      p[PROJECT_PROPS.category],
    ) as ProjectCategory | null,
    kinds: getMultiSelectNames(p[PROJECT_PROPS.kinds]),
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    memo: getRichText(p[PROJECT_PROPS.memo]),
    taskIds: getRelationIds(p[PROJECT_PROPS.tasks]),
    url: page.url,
  };
}
