import { useEffect } from "react";
import { Spinner } from "@repo/ui";
import { AppLayout } from "../../components/AppLayout";
import { PomodoroTimer } from "../../features/pomodoro/components/PomodoroTimer";
import { PomodoroSettings } from "../../features/pomodoro/components/PomodoroSettings";
import { usePomodoroTicker } from "../../features/pomodoro/hooks/usePomodoroTicker";
import { usePomodoroStore } from "../../features/pomodoro/store/usePomodoroStore";
import { QuickAddTask } from "../../features/task/components/QuickAddTask";
import { TaskCard } from "../../features/task/components/TaskCard";
import { useTasks } from "../../features/task/hooks/useTasks";
import { useTaskMutations } from "../../features/task/hooks/useTaskMutations";
import type { TaskItem } from "@repo/types/notion-todo-pomodoro-app";
import { groupTasksByWorkingHours } from "../../features/task/lib/workingHours";
import { nowIsoWithOffset } from "../../lib/format";

export default function HomePage() {
  usePomodoroTicker();

  const { tasks, isLoading, error } = useTasks({ scope: "today", limit: 50 });
  const { updateTask, isSubmitting } = useTaskMutations();
  const setActiveTask = usePomodoroStore((s) => s.setActiveTask);
  const startFocus = usePomodoroStore((s) => s.startFocus);
  const activeTask = usePomodoroStore((s) => s.activeTask);

  // 通知許可を一度だけ確認
  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // START: ポモドーロ対象にしてタイマー開始 & Notion を「進行中 + 開始時刻」に更新
  const handleStart = (task: TaskItem) => {
    startFocus({ id: task.id, name: task.name });
    void updateTask(task.id, {
      status: "In progress",
      // まだ開始時刻が無ければ現在時刻を記録
      ...(task.startTime ? {} : { startTime: nowIsoWithOffset() }),
    });
  };

  const handleComplete = async (task: TaskItem) => {
    await updateTask(task.id, {
      status: "Complete",
      endTime: nowIsoWithOffset(),
    });
    if (activeTask?.id === task.id) setActiveTask(null);
  };

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 左: 今日のタスク */}
        <section className="order-2 space-y-4 lg:order-1">
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-bold">今日のフォーカス</h1>
            <span className="text-sm text-muted-foreground">
              {tasks.length} 件
            </span>
          </div>

          <QuickAddTask scheduleToday />

          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              タスクの取得に失敗しました。APIサーバ(localhost:3000)が起動しているか確認してください。
            </p>
          )}
          {!isLoading && !error && tasks.length === 0 && (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              今日の予定(Schedule)が設定されたタスクはありません。
              <br />
              上のフォームから追加できます。
            </p>
          )}

          <div className="space-y-5">
            {groupTasksByWorkingHours(tasks).map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center gap-2 border-b pb-1">
                  <span>{group.icon}</span>
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {group.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {group.tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isActive={activeTask?.id === task.id}
                      onStart={handleStart}
                      onComplete={handleComplete}
                      busy={isSubmitting}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 右: タイマー */}
        <aside className="order-1 space-y-4 lg:order-2">
          <PomodoroTimer />
          <PomodoroSettings />
        </aside>
      </div>
    </AppLayout>
  );
}
