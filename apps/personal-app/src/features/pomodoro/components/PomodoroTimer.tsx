import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Play, Pause, RotateCcw, SkipForward } from "@repo/ui/icons";
import {
  usePomodoroStore,
  minutesForMode,
  type PomodoroMode,
} from "../store/usePomodoroStore";
import { formatClock } from "../../../lib/format";

const MODE_META: Record<
  PomodoroMode,
  { label: string; accent: string; ring: string }
> = {
  work: { label: "作業", accent: "text-red-600", ring: "stroke-red-500" },
  short: { label: "小休憩", accent: "text-green-600", ring: "stroke-green-500" },
  long: { label: "長い休憩", accent: "text-blue-600", ring: "stroke-blue-500" },
};

const MODES: PomodoroMode[] = ["work", "short", "long"];
const MODE_TAB_LABEL: Record<PomodoroMode, string> = {
  work: "作業",
  short: "小休憩",
  long: "長休憩",
};

export function PomodoroTimer() {
  const mode = usePomodoroStore((s) => s.mode);
  const settings = usePomodoroStore((s) => s.settings);
  const remaining = usePomodoroStore((s) => s.remaining);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const completedWork = usePomodoroStore((s) => s.completedWork);
  const activeTask = usePomodoroStore((s) => s.activeTask);
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const reset = usePomodoroStore((s) => s.reset);
  const skip = usePomodoroStore((s) => s.skip);
  const setActiveTask = usePomodoroStore((s) => s.setActiveTask);

  const total = minutesForMode(mode, settings) * 60;
  const progress = total > 0 ? 1 - remaining / total : 0;
  const meta = MODE_META[mode];

  // SVG リング
  const size = 240;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  // モードタブは停止中のみ切り替え可
  const switchMode = (target: PomodoroMode) => {
    if (target === mode) return;
    usePomodoroStore.setState({
      mode: target,
      isRunning: false,
      deadline: null,
      remaining: minutesForMode(target, settings) * 60,
    });
  };

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border bg-card p-6">
      {/* モードタブ */}
      <div className="flex rounded-lg bg-secondary p-1">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={isRunning}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50",
              mode === m
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {MODE_TAB_LABEL[m]}
          </button>
        ))}
      </div>

      {/* リング + 時間 */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={cn(meta.ring, "transition-[stroke-dashoffset] duration-500")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-sm font-medium", meta.accent)}>
            {meta.label}
          </span>
          <span className="font-mono text-5xl font-bold tabular-nums">
            {formatClock(remaining)}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            本日 {completedWork} セッション完了
          </span>
        </div>
      </div>

      {/* 対象タスク */}
      <div className="min-h-6 text-center text-sm">
        {activeTask ? (
          <span className="inline-flex items-center gap-2">
            <span className="text-muted-foreground">集中中:</span>
            <span className="font-medium">{activeTask.name}</span>
            <button
              onClick={() => setActiveTask(null)}
              className="text-xs text-muted-foreground underline"
            >
              解除
            </button>
          </span>
        ) : (
          <span className="text-muted-foreground">
            タスクを選ぶと集中対象になります
          </span>
        )}
      </div>

      {/* コントロール */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Button size="lg" onClick={pause}>
            <Pause className="size-5" />
            一時停止
          </Button>
        ) : (
          <Button size="lg" onClick={start}>
            <Play className="size-5" />
            開始
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={reset} title="リセット">
          <RotateCcw className="size-5" />
        </Button>
        <Button size="lg" variant="outline" onClick={skip} title="スキップ">
          <SkipForward className="size-5" />
        </Button>
      </div>
    </div>
  );
}
