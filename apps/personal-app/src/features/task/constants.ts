import type {
  TaskStatus,
  TaskCategory,
} from "@repo/types/notion-todo-pomodoro-app";

/** Status の表示ラベルと Badge の配色 */
export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  "To-do": {
    label: "未着手",
    className: "bg-secondary text-secondary-foreground",
  },
  "In progress": {
    label: "進行中",
    className: "bg-blue-100 text-blue-700",
  },
  Complete: {
    label: "完了",
    className: "bg-green-100 text-green-700",
  },
};

/** ステータスの遷移順（トグル用） */
export const TASK_STATUS_ORDER: TaskStatus[] = [
  "To-do",
  "In progress",
  "Complete",
];

export const TASK_CATEGORY_LABEL: Record<TaskCategory, string> = {
  "✅️ Task": "タスク",
  "📥️ Inbox": "受信箱",
  "📅 Schedule": "予定",
};
