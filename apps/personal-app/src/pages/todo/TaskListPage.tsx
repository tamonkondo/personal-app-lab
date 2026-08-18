import { useSearchParams } from "react-router-dom";
import { Spinner } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { QuickAddTask } from "../../features/task/components/QuickAddTask";
import { TaskCard } from "../../features/task/components/TaskCard";
import { useTasks } from "../../features/task/hooks/useTasks";
import { useTaskMutations } from "../../features/task/hooks/useTaskMutations";
import { useProjects } from "../../features/project/hooks/useProjects";
import { usePomodoroStore } from "../../features/pomodoro/store/usePomodoroStore";
import {
  taskListParamsSchema,
  TASK_SCOPES,
  type TaskScope,
} from "@repo/schemas/notion-todo-pomodoro-app";
import {
  TASK_STATUSES,
  TASK_CATEGORIES,
  type TaskItem,
} from "@repo/types/notion-todo-pomodoro-app";
import {
  TASK_STATUS_META,
  TASK_CATEGORY_LABEL,
} from "../../features/task/constants";
import { nowIsoWithOffset } from "../../lib/format";

const SCOPE_LABEL: Record<TaskScope, string> = {
  today: "今日",
  active: "未完了",
  all: "すべて",
};

export default function TaskListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = taskListParamsSchema.parse({
    scope: searchParams.get("scope"),
    status: searchParams.get("status"),
    category: searchParams.get("category"),
    projectId: searchParams.get("projectId"),
  });

  const { tasks, isLoading, error } = useTasks({ ...params, limit: 100 });
  const { updateTask, isSubmitting } = useTaskMutations();
  const { projects } = useProjects();
  const startFocus = usePomodoroStore((s) => s.startFocus);
  const activeTaskId = usePomodoroStore((s) => s.activeTask?.id);

  const setParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const handleStart = (task: TaskItem) => {
    startFocus({ id: task.id, name: task.name });
    void updateTask(task.id, {
      status: "In progress",
      ...(task.startTime ? {} : { startTime: nowIsoWithOffset() }),
    });
  };
  const handleComplete = (task: TaskItem) =>
    updateTask(task.id, { status: "Complete", endTime: nowIsoWithOffset() });

  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "";

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-xl font-bold">タスク</h1>

        <QuickAddTask defaultProjectId={params.projectId ?? undefined} />

        {/* フィルタ */}
        <div className="space-y-3 rounded-lg border p-3 text-sm">
          <FilterRow label="表示範囲">
            {TASK_SCOPES.map((s) => (
              <Chip
                key={s}
                active={params.scope === s}
                onClick={() => setParam("scope", s)}
              >
                {SCOPE_LABEL[s]}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="ステータス">
            <Chip
              active={!params.status}
              onClick={() => setParam("status", null)}
            >
              すべて
            </Chip>
            {TASK_STATUSES.map((s) => (
              <Chip
                key={s}
                active={params.status === s}
                onClick={() => setParam("status", s)}
              >
                {TASK_STATUS_META[s].label}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="カテゴリ">
            <Chip
              active={!params.category}
              onClick={() => setParam("category", null)}
            >
              すべて
            </Chip>
            {TASK_CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={params.category === c}
                onClick={() => setParam("category", c)}
              >
                {TASK_CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </FilterRow>

          {projects.length > 0 && (
            <FilterRow label="プロジェクト">
              <select
                value={params.projectId ?? ""}
                onChange={(e) => setParam("projectId", e.target.value || null)}
                className="h-8 max-w-[240px] rounded-md border bg-background px-2"
              >
                <option value="">すべて</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || "(無題)"}
                  </option>
                ))}
              </select>
            </FilterRow>
          )}
        </div>

        {/* 一覧 */}
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            タスクの取得に失敗しました。APIサーバを確認してください。
          </p>
        )}
        {!isLoading && !error && tasks.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            条件に一致するタスクはありません。
          </p>
        )}

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id}>
              <TaskCard
                task={task}
                isActive={activeTaskId === task.id}
                onStart={handleStart}
                onComplete={handleComplete}
                busy={isSubmitting}
              />
              {!params.projectId && task.projectId && (
                <p className="mt-0.5 pl-3 text-xs text-muted-foreground">
                  {projectName(task.projectId)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}
