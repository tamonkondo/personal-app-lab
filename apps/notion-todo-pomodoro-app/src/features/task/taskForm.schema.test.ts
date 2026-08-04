import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultTaskFormValues,
  taskFormSchema,
  toCreateTaskInput,
  type TaskFormValues,
} from "./taskForm.schema";

const validValues: TaskFormValues = {
  name: "資料作成",
  category: "✅️ Task",
  pomodoros: 2,
  workingHours: "5:00 - 12:00",
  projectId: "project-1",
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("taskFormSchema", () => {
  it("正しい入力を受け付ける", () => {
    expect(taskFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("タスク名は空白のみを拒否する", () => {
    expect(
      taskFormSchema.safeParse({ ...validValues, name: "  " }).success,
    ).toBe(false);
  });

  it("見積ポモドーロ数は 1〜4 のみ許可する", () => {
    expect(
      taskFormSchema.safeParse({ ...validValues, pomodoros: 0 }).success,
    ).toBe(false);
    expect(
      taskFormSchema.safeParse({ ...validValues, pomodoros: 4 }).success,
    ).toBe(true);
    expect(
      taskFormSchema.safeParse({ ...validValues, pomodoros: 5 }).success,
    ).toBe(false);
  });

  it("時間帯は enum か空文字のみ許可する", () => {
    expect(
      taskFormSchema.safeParse({ ...validValues, workingHours: "" }).success,
    ).toBe(true);
    expect(
      taskFormSchema.safeParse({ ...validValues, workingHours: "0:00 - 5:00" })
        .success,
    ).toBe(false);
  });
});

describe("defaultTaskFormValues", () => {
  it("時間帯は現在時刻の時間帯で初期化する", () => {
    vi.setSystemTime(new Date(2026, 7, 5, 10, 0, 0));
    expect(defaultTaskFormValues().workingHours).toBe("5:00 - 12:00");
  });

  it("時間帯の範囲外 (深夜) は未設定で初期化する", () => {
    vi.setSystemTime(new Date(2026, 7, 5, 3, 0, 0));
    expect(defaultTaskFormValues().workingHours).toBe("");
  });

  it("defaultProjectId を反映する", () => {
    vi.setSystemTime(new Date(2026, 7, 5, 10, 0, 0));
    expect(defaultTaskFormValues("project-1").projectId).toBe("project-1");
    expect(defaultTaskFormValues().projectId).toBe("");
  });
});

describe("toCreateTaskInput", () => {
  it("フォーム値を API 入力へ変換する (status は To-do 固定)", () => {
    expect(toCreateTaskInput({ ...validValues, name: " 資料作成 " })).toEqual({
      name: "資料作成",
      category: "✅️ Task",
      status: "To-do",
      estimatedPomodoros: 2,
      workingHours: "5:00 - 12:00",
      projectId: "project-1",
    });
  });

  it("未設定の時間帯 / プロジェクトは undefined にする", () => {
    const input = toCreateTaskInput({
      ...validValues,
      workingHours: "",
      projectId: "",
    });
    expect(input.workingHours).toBeUndefined();
    expect(input.projectId).toBeUndefined();
  });
});
