import { Badge, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Play, Check, Clock } from "@repo/ui/icons";
import type { TaskItem } from "@repo/types/notion-todo-pomodoro-app";
import { TASK_STATUS_META, TASK_CATEGORY_LABEL } from "../constants";
import { formatDateTime } from "../../../lib/format";

type TaskCardProps = {
  task: TaskItem;
  isActive?: boolean;
  /** START: ポモドーロ対象にしてタイマー開始 & プロパティ更新 */
  onStart?: (task: TaskItem) => void;
  onComplete?: (task: TaskItem) => void;
  busy?: boolean;
};

export function TaskCard({
  task,
  isActive,
  onStart,
  onComplete,
  busy,
}: TaskCardProps) {
  const isComplete = task.status === "Complete";
  const statusMeta = task.status ? TASK_STATUS_META[task.status] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors",
        isActive && "border-primary ring-1 ring-primary",
        isComplete && "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "truncate font-medium",
              isComplete && "line-through",
            )}
          >
            {task.name || "(無題)"}
          </p>
          {statusMeta && (
            <Badge className={cn("shrink-0", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.category && (
            <span>{TASK_CATEGORY_LABEL[task.category] ?? task.category}</span>
          )}
          {task.estimatedPomodoros != null && (
            <span title="見積ポモドーロ数">
              {"🍅".repeat(task.estimatedPomodoros)}
            </span>
          )}
          {task.actualWorkMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {task.actualWorkMinutes}分
            </span>
          )}
          {task.scheduledStart && (
            <span>{formatDateTime(task.scheduledStart)}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!isComplete && onStart && (
          <Button
            size="sm"
            variant={isActive ? "default" : "outline"}
            disabled={busy}
            onClick={() => onStart(task)}
            title="ポモドーロを開始し、進行中にする"
          >
            <Play className="size-4" />
            START
          </Button>
        )}
        {!isComplete && onComplete && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onComplete(task)}
            title="完了にする"
          >
            <Check className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
