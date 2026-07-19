import { useState } from "react";
import { Button, Input } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Plus } from "@repo/ui/icons";
import {
  TASK_CATEGORIES,
  WORKING_HOURS_OPTIONS,
  type TaskCategory,
  type WorkingHours,
} from "@repo/types/notion-todo-pomodoro-app";
import { useTaskMutations } from "../hooks/useTaskMutations";
import { useProjects } from "../../project/hooks/useProjects";
import { TASK_CATEGORY_LABEL } from "../constants";
import { currentWorkingHours, WORKING_HOURS_META } from "../lib/workingHours";

type QuickAddTaskProps = {
  /** 予定日を今日に設定する（ホームの「今日」ビュー向け） */
  scheduleToday?: boolean;
  defaultProjectId?: string;
};

const POMODORO_CHOICES = [1, 2, 3, 4];

export function QuickAddTask({
  scheduleToday,
  defaultProjectId,
}: QuickAddTaskProps) {
  const { createTask, isSubmitting } = useTaskMutations();
  const { projects } = useProjects();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<TaskCategory>("✅️ Task");
  const [pomodoros, setPomodoros] = useState(1);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  // 既定は現在時刻の時間帯。範囲外なら未設定
  const [workingHours, setWorkingHours] = useState<WorkingHours | "">(
    () => currentWorkingHours() ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      await createTask({
        name: trimmed,
        category,
        status: "To-do",
        estimatedPomodoros: pomodoros,
        workingHours: workingHours || undefined,
        projectId: projectId || undefined,
        scheduledStart: scheduleToday ? todayDateString() : undefined,
      });
      setName("");
      setPomodoros(1);
    } catch {
      setError("作成に失敗しました。APIサーバを確認してください。");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-3">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="タスクを追加..."
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          <Plus className="size-4" />
          追加
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
          className="h-8 rounded-md border bg-background px-2"
        >
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TASK_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value as WorkingHours | "")}
          className="h-8 rounded-md border bg-background px-2"
          title="時間帯"
        >
          <option value="">時間帯なし</option>
          {WORKING_HOURS_OPTIONS.map((wh) => (
            <option key={wh} value={wh}>
              {WORKING_HOURS_META[wh].icon} {wh}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">見積</span>
          {POMODORO_CHOICES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPomodoros(n)}
              className={cn(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                pomodoros === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-secondary",
              )}
            >
              {"🍅".repeat(n)}
            </button>
          ))}
        </div>

        {projects.length > 0 && (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-8 max-w-[200px] rounded-md border bg-background px-2"
          >
            <option value="">プロジェクトなし</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || "(無題)"}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

function todayDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
