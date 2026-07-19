import type { PaginatedResponse } from "../index";

/**
 * PROJECTS DB の status プロパティ（Notion 側の実値）
 */
export const PROJECT_STATUSES = ["Not started", "In progress", "Done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * PROJECTS DB の Category プロパティ（Notion 側の実値）
 */
export const PROJECT_CATEGORIES = ["App", "Book", "Project"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/**
 * PROJECTS DB の kinds プロパティ（multi_select）
 */
export const PROJECT_KINDS = [
  "スマホアプリ",
  "デスクトップアプリ",
  "Web",
] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export type ProjectItem = {
  id: string;
  name: string;
  goal: string;
  status: ProjectStatus | null;
  category: ProjectCategory | null;
  kinds: string[];
  scheduledStart: string | null;
  scheduledEnd: string | null;
  memo: string;
  /** 紐づくタスクのページID一覧 */
  taskIds: string[];
  url: string;
};

export type ProjectListResponse = PaginatedResponse<ProjectItem>;
