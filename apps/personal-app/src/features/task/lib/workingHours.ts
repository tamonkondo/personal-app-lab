import {
  WORKING_HOURS_OPTIONS,
  type WorkingHours,
  type TaskItem,
} from "@repo/types/notion-todo-pomodoro-app";

/** 時間帯ごとの見出しに添えるアイコン */
export const WORKING_HOURS_META: Record<
  WorkingHours,
  { label: string; icon: string }
> = {
  "5:00 - 12:00": { label: "5:00 - 12:00", icon: "🌅" },
  "12:00 - 18:00": { label: "12:00 - 18:00", icon: "☀️" },
  "18:00 - 23:00": { label: "18:00 - 23:00", icon: "🌙" },
};

/** 現在時刻に対応する時間帯を返す（範囲外は null） */
export function currentWorkingHours(): WorkingHours | null {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "5:00 - 12:00";
  if (h >= 12 && h < 18) return "12:00 - 18:00";
  if (h >= 18 && h < 23) return "18:00 - 23:00";
  return null;
}

export type WorkingHoursGroup = {
  key: WorkingHours | "none";
  label: string;
  icon: string;
  tasks: TaskItem[];
};

/**
 * タスクを Working hours ごとにグループ化する。
 * 時間帯の順序を保ち、未設定は最後に「その他」としてまとめる。
 * 空のグループは返さない。
 */
export function groupTasksByWorkingHours(tasks: TaskItem[]): WorkingHoursGroup[] {
  const groups: WorkingHoursGroup[] = WORKING_HOURS_OPTIONS.map((wh) => ({
    key: wh,
    label: WORKING_HOURS_META[wh].label,
    icon: WORKING_HOURS_META[wh].icon,
    tasks: [] as TaskItem[],
  }));
  const none: WorkingHoursGroup = {
    key: "none",
    label: "時間帯未設定",
    icon: "🗂️",
    tasks: [],
  };

  for (const task of tasks) {
    const group = task.workingHours
      ? groups.find((g) => g.key === task.workingHours)
      : undefined;
    (group ?? none).tasks.push(task);
  }

  return [...groups, none].filter((g) => g.tasks.length > 0);
}
