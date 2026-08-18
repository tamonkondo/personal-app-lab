import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Plus } from "@repo/ui/icons";
import {
  TASK_CATEGORIES,
  WORKING_HOURS_OPTIONS,
} from "@repo/types/notion-todo-pomodoro-app";
import { useTaskMutations } from "../hooks/useTaskMutations";
import { useProjects } from "../../project/hooks/useProjects";
import { TASK_CATEGORY_LABEL } from "../constants";
import { WORKING_HOURS_META } from "../lib/workingHours";
import {
  defaultTaskFormValues,
  taskFormSchema,
  toCreateTaskInput,
  type TaskFormValues,
} from "../taskForm.schema";

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultTaskFormValues(defaultProjectId),
    mode: "onChange",
  });
  const { register, control, formState, getValues, reset } = form;

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createTask({
        ...toCreateTaskInput(values),
        scheduledStart: scheduleToday ? todayDateString() : undefined,
      });
      // カテゴリ・時間帯・プロジェクトは維持し、名前と見積だけ初期化する
      reset({ ...getValues(), name: "", pomodoros: 1 });
    } catch {
      setSubmitError("作成に失敗しました。APIサーバを確認してください。");
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-3">
      <div className="flex gap-2">
        <Input
          placeholder="タスクを追加..."
          className="flex-1"
          {...register("name")}
        />
        <Button type="submit" disabled={isSubmitting || !formState.isValid}>
          <Plus className="size-4" />
          追加
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          className="h-8 rounded-md border bg-background px-2"
          {...register("category")}
        >
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TASK_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          className="h-8 rounded-md border bg-background px-2"
          title="時間帯"
          {...register("workingHours")}
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
          <Controller
            control={control}
            name="pomodoros"
            render={({ field }) => (
              <>
                {POMODORO_CHOICES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs transition-colors",
                      field.value === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-secondary",
                    )}
                  >
                    {"🍅".repeat(n)}
                  </button>
                ))}
              </>
            )}
          />
        </div>

        {projects.length > 0 && (
          <select
            className="h-8 max-w-[200px] rounded-md border bg-background px-2"
            {...register("projectId")}
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

      {submitError && <p className="text-xs text-destructive">{submitError}</p>}
    </form>
  );
}

function todayDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
