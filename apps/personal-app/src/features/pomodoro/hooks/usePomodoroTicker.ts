import { useEffect } from "react";
import { usePomodoroStore, minutesForMode } from "../store/usePomodoroStore";
import { playChime } from "../lib/chime";

/**
 * 1秒ごとに tick を実行し、タイマーを進める。
 * アプリ全体で一度だけマウントする（Home に配置）。
 * セッション完了時の通知・音・タイトル更新もここで扱う。
 */
export function usePomodoroTicker() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const tick = usePomodoroStore((s) => s.tick);

  // 1秒ごとの tick
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [isRunning, tick]);

  // セッション完了時の副作用（音・通知）
  const justCompletedMode = usePomodoroStore((s) => s.justCompletedMode);
  const acknowledge = usePomodoroStore((s) => s.acknowledgeCompletion);
  const soundEnabled = usePomodoroStore((s) => s.settings.soundEnabled);
  useEffect(() => {
    if (!justCompletedMode) return;
    if (soundEnabled) playChime();
    const label = justCompletedMode === "work" ? "作業セッション完了" : "休憩終了";
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      new Notification("🍅 Pomodoro", { body: `${label} — 次に進みましょう` });
    }
    acknowledge();
  }, [justCompletedMode, soundEnabled, acknowledge]);

  // タブのタイトルに残り時間を表示
  const remaining = usePomodoroStore((s) => s.remaining);
  const mode = usePomodoroStore((s) => s.mode);
  useEffect(() => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    const icon = mode === "work" ? "🍅" : "☕";
    document.title = isRunning
      ? `${icon} ${mm}:${ss} — Pomodoro`
      : "Pomodoro Tasks";
    return () => {
      document.title = "Pomodoro Tasks";
    };
  }, [remaining, mode, isRunning]);
}

export { minutesForMode };
