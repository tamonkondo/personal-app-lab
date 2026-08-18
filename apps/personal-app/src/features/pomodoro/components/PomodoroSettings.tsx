import { useState } from "react";
import { Settings } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/utils";
import { usePomodoroStore } from "../store/usePomodoroStore";

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        className="h-8 w-16 rounded-md border bg-background px-2 text-right"
      />
    </label>
  );
}

export function PomodoroSettings() {
  const [open, setOpen] = useState(false);
  const settings = usePomodoroStore((s) => s.settings);
  const updateSettings = usePomodoroStore((s) => s.updateSettings);

  return (
    <div className="rounded-xl border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span className="inline-flex items-center gap-2">
          <Settings className="size-4" />
          タイマー設定
        </span>
        <span className="text-muted-foreground">{open ? "閉じる" : "開く"}</span>
      </button>
      <div className={cn("space-y-3 px-4 pb-4", !open && "hidden")}>
        <NumberField
          label="作業(分)"
          value={settings.workMinutes}
          min={1}
          max={90}
          onChange={(n) => updateSettings({ workMinutes: n })}
        />
        <NumberField
          label="小休憩(分)"
          value={settings.shortBreakMinutes}
          min={1}
          max={60}
          onChange={(n) => updateSettings({ shortBreakMinutes: n })}
        />
        <NumberField
          label="長い休憩(分)"
          value={settings.longBreakMinutes}
          min={1}
          max={60}
          onChange={(n) => updateSettings({ longBreakMinutes: n })}
        />
        <NumberField
          label="長休憩の間隔(セッション)"
          value={settings.longBreakInterval}
          min={2}
          max={8}
          onChange={(n) => updateSettings({ longBreakInterval: n })}
        />
        <label className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">完了時に音を鳴らす</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="size-4"
          />
        </label>
      </div>
    </div>
  );
}
