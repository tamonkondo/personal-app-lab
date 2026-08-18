import { create } from "zustand";

export type PomodoroMode = "work" | "short" | "long";

export type PomodoroSettings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** 何回の作業セッションごとに長い休憩を入れるか */
  longBreakInterval: number;
  /** 完了時に音を鳴らすか */
  soundEnabled: boolean;
};

export type ActiveTask = {
  id: string;
  name: string;
} | null;

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
};

// アプリ統合後もキーは据え置き（変更すると既存の設定が初期化されるため）
const SETTINGS_KEY = "ntpa:pomodoro-settings";

function loadSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function minutesForMode(
  mode: PomodoroMode,
  settings: PomodoroSettings,
): number {
  switch (mode) {
    case "work":
      return settings.workMinutes;
    case "short":
      return settings.shortBreakMinutes;
    case "long":
      return settings.longBreakMinutes;
  }
}

type PomodoroState = {
  settings: PomodoroSettings;
  mode: PomodoroMode;
  isRunning: boolean;
  /** 残り秒数 */
  remaining: number;
  /** 実行中の終了時刻(ms)。停止中は null */
  deadline: number | null;
  /** 完了した作業セッション数 */
  completedWork: number;
  activeTask: ActiveTask;
  /** 直近でセッションが完了したことを画面に伝える合図（タイムスタンプ） */
  justCompletedMode: PomodoroMode | null;

  setActiveTask: (task: ActiveTask) => void;
  /** タスクを対象にして作業ポモドーロを最初から開始する */
  startFocus: (task: NonNullable<ActiveTask>) => void;
  updateSettings: (patch: Partial<PomodoroSettings>) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  acknowledgeCompletion: () => void;
};

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const initialSettings = loadSettings();
  return {
    settings: initialSettings,
    mode: "work",
    isRunning: false,
    remaining: minutesForMode("work", initialSettings) * 60,
    deadline: null,
    completedWork: 0,
    activeTask: null,
    justCompletedMode: null,

    setActiveTask: (task) => set({ activeTask: task }),

    startFocus: (task) =>
      set((state) => {
        const remaining = minutesForMode("work", state.settings) * 60;
        return {
          activeTask: task,
          mode: "work",
          remaining,
          isRunning: true,
          deadline: Date.now() + remaining * 1000,
        };
      }),

    updateSettings: (patch) =>
      set((state) => {
        const settings = { ...state.settings, ...patch };
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
          // ignore
        }
        // 停止中なら現在モードの残り時間も更新する
        const remaining = state.isRunning
          ? state.remaining
          : minutesForMode(state.mode, settings) * 60;
        return { settings, remaining };
      }),

    start: () =>
      set((state) => {
        if (state.isRunning) return state;
        const remaining =
          state.remaining > 0
            ? state.remaining
            : minutesForMode(state.mode, state.settings) * 60;
        return {
          isRunning: true,
          remaining,
          deadline: Date.now() + remaining * 1000,
        };
      }),

    pause: () =>
      set((state) => {
        if (!state.isRunning || state.deadline == null) return state;
        const remaining = Math.max(
          0,
          Math.round((state.deadline - Date.now()) / 1000),
        );
        return { isRunning: false, deadline: null, remaining };
      }),

    reset: () =>
      set((state) => ({
        isRunning: false,
        deadline: null,
        remaining: minutesForMode(state.mode, state.settings) * 60,
      })),

    skip: () =>
      set((state) => {
        const next = nextMode(state.mode, state.completedWork, state.settings);
        return {
          mode: next.mode,
          completedWork: next.completedWork,
          isRunning: false,
          deadline: null,
          remaining: minutesForMode(next.mode, state.settings) * 60,
        };
      }),

    tick: () => {
      const state = get();
      if (!state.isRunning || state.deadline == null) return;
      const remaining = Math.max(
        0,
        Math.round((state.deadline - Date.now()) / 1000),
      );
      if (remaining > 0) {
        set({ remaining });
        return;
      }
      // セッション完了 → 次のモードへ
      const completedMode = state.mode;
      const next = nextMode(state.mode, state.completedWork, state.settings);
      set({
        mode: next.mode,
        completedWork: next.completedWork,
        isRunning: false,
        deadline: null,
        remaining: minutesForMode(next.mode, state.settings) * 60,
        justCompletedMode: completedMode,
      });
    },

    acknowledgeCompletion: () => set({ justCompletedMode: null }),
  };
});

/** 現在モードと完了数から次のモードを決める */
function nextMode(
  mode: PomodoroMode,
  completedWork: number,
  settings: PomodoroSettings,
): { mode: PomodoroMode; completedWork: number } {
  if (mode === "work") {
    const nextCompleted = completedWork + 1;
    const isLong = nextCompleted % settings.longBreakInterval === 0;
    return { mode: isLong ? "long" : "short", completedWork: nextCompleted };
  }
  // 休憩明けは作業へ
  return { mode: "work", completedWork };
}
