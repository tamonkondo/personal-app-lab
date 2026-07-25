/**
 * PROJECTS DB の定義ファイル。
 * Notion の生プロパティ名と「ページ → ドメイン型」の変換を知る唯一の場所。
 * ページの読み取りは zod でランタイム検証する (as unknown as キャスト禁止)。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1)
 */
import { z } from "zod";
import {
  notionTitle,
  notionStatus,
  notionSelect,
  notionRichText,
  notionMultiSelect,
  notionDate,
  notionRelation,
  notionPage,
} from "@/integrations/notion/notion.schema";
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

/** プロジェクトページのスキーマ (パースと同時にドメイン値へ変換) */
const projectPageSchema = notionPage({
  [PROJECT_PROPS.name]: notionTitle(),
  [PROJECT_PROPS.goal]: notionRichText(),
  [PROJECT_PROPS.status]: notionStatus(),
  [PROJECT_PROPS.category]: notionSelect(),
  [PROJECT_PROPS.kinds]: notionMultiSelect(),
  [PROJECT_PROPS.schedule]: notionDate(),
  [PROJECT_PROPS.memo]: notionRichText(),
  [PROJECT_PROPS.tasks]: notionRelation(),
});

export type ProjectPage = z.infer<typeof projectPageSchema>;

/** 生の Notion ページ (unknown) → フロント表示モデル */
export function mapProjectPage(raw: unknown): ProjectItem {
  const page = projectPageSchema.parse(raw);
  const p = page.properties;
  const schedule = p[PROJECT_PROPS.schedule];
  return {
    id: page.id,
    name: p[PROJECT_PROPS.name],
    goal: p[PROJECT_PROPS.goal],
    status: p[PROJECT_PROPS.status] as ProjectStatus | null,
    category: p[PROJECT_PROPS.category] as ProjectCategory | null,
    kinds: p[PROJECT_PROPS.kinds],
    scheduledStart: schedule?.start ?? null,
    scheduledEnd: schedule?.end ?? null,
    memo: p[PROJECT_PROPS.memo],
    taskIds: p[PROJECT_PROPS.tasks],
    url: page.url,
  };
}
