import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrainingLogDetail } from "@repo/types/notion-training-app";
import {
  detailToFormValues,
  emptyTrainingLogFormValues,
  isFilledSet,
  todayDateString,
  toCreateTrainingLogInput,
  toUpdateTrainingLogInput,
  trainingLogFormSchema,
  type TrainingLogFormValues,
} from "./trainingLogForm.schema";

const validValues: TrainingLogFormValues = {
  date: "2026-08-01",
  bodyWeight: "72.5",
  memo: "調子良い",
  exercises: [
    {
      logId: null,
      exerciseId: "exercise-1",
      exerciseName: "ベンチプレス",
      rest: "90",
      memo: "",
      sets: [{ setId: null, kg: "100", rep: "5", memo: "" }],
    },
  ],
};

/** 取得済み詳細のフィクスチャ */
const detailFixture = (): TrainingLogDetail => ({
  id: "training-1",
  createdTime: "2026-07-20T10:00:00.000Z",
  bodyParts: ["胸"],
  memo: "胸の日",
  bodyWeight: 72.5,
  totalExerciseCount: 1,
  totalSetsCount: 2,
  totalTrainingVolumeWeight: 1300,
  exercises: [
    {
      id: "log-1",
      trainingName: "ベンチプレス",
      maxGoalWeight: 110,
      currentMaxWeight: 100,
      isPr: false,
      musclesTypes: ["胸"],
      memo: "フォーム意識",
      exerciseSets: {
        exerciseLogId: "log-1",
        exerciseId: "exercise-1",
        createdTime: "2026-07-20T10:00:00.000Z",
        rest: 90,
        trainingName: "ベンチプレス",
        sets: [
          {
            exerciseId: "exercise-1",
            id: "set-1",
            kg: 100,
            rep: 5,
            maxWeight: 100,
            memo: "メモ1",
            notionUrl: "",
          },
          {
            exerciseId: "exercise-1",
            id: "set-2",
            kg: 80,
            rep: 10,
            maxWeight: 100,
            memo: "",
            notionUrl: "",
          },
        ],
        notionUrl: "",
      },
    },
  ],
});

beforeEach(() => {
  vi.useFakeTimers();
  // ローカルタイムの 2026-08-05 10:00 に固定 (日付検証を決定的にする)
  vi.setSystemTime(new Date(2026, 7, 5, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("todayDateString", () => {
  it("ローカルタイムの当日を YYYY-MM-DD で返す", () => {
    expect(todayDateString()).toBe("2026-08-05");
  });
});

describe("trainingLogFormSchema", () => {
  it("正しい入力を受け付ける", () => {
    expect(trainingLogFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("日付は当日まで許可し、未来日と空文字は拒否する", () => {
    expect(
      trainingLogFormSchema.safeParse({ ...validValues, date: "2026-08-05" })
        .success,
    ).toBe(true);
    expect(
      trainingLogFormSchema.safeParse({ ...validValues, date: "2026-08-06" })
        .success,
    ).toBe(false);
    expect(
      trainingLogFormSchema.safeParse({ ...validValues, date: "" }).success,
    ).toBe(false);
  });

  it("種目 0 件は拒否する", () => {
    expect(
      trainingLogFormSchema.safeParse({ ...validValues, exercises: [] })
        .success,
    ).toBe(false);
  });

  it("入力済みセットが1つもない種目は拒否する", () => {
    const values = {
      ...validValues,
      exercises: [
        {
          ...validValues.exercises[0]!,
          sets: [{ setId: null, kg: "", rep: "", memo: "" }],
        },
      ],
    };
    expect(trainingLogFormSchema.safeParse(values).success).toBe(false);
  });

  it("kg / bodyWeight は数値文字列以外を拒否する", () => {
    expect(
      trainingLogFormSchema.safeParse({ ...validValues, bodyWeight: "abc" })
        .success,
    ).toBe(false);
    const values = {
      ...validValues,
      exercises: [
        {
          ...validValues.exercises[0]!,
          sets: [{ setId: null, kg: "重い", rep: "5", memo: "" }],
        },
      ],
    };
    expect(trainingLogFormSchema.safeParse(values).success).toBe(false);
  });
});

describe("isFilledSet", () => {
  it("kg / rep のどちらかが入力されていれば入力済み扱い", () => {
    expect(isFilledSet({ kg: "100", rep: "" })).toBe(true);
    expect(isFilledSet({ kg: "", rep: "5" })).toBe(true);
    expect(isFilledSet({ kg: "", rep: "" })).toBe(false);
    expect(isFilledSet({ kg: " ", rep: " " })).toBe(false);
  });
});

describe("emptyTrainingLogFormValues", () => {
  it("日付は当日で初期化する", () => {
    expect(emptyTrainingLogFormValues().date).toBe("2026-08-05");
  });
});

describe("detailToFormValues", () => {
  it("既存記録をフォーム値へ変換する (日付は記録日、ID は保持)", () => {
    const values = detailToFormValues(detailFixture());
    expect(values.date).toBe("2026-07-20");
    expect(values.bodyWeight).toBe("72.5");
    expect(values.memo).toBe("胸の日");

    const exercise = values.exercises[0]!;
    expect(exercise.logId).toBe("log-1");
    expect(exercise.exerciseId).toBe("exercise-1");
    expect(exercise.rest).toBe("90");
    expect(exercise.memo).toBe("フォーム意識");
    expect(exercise.sets).toEqual([
      { setId: "set-1", kg: "100", rep: "5", memo: "メモ1" },
      { setId: "set-2", kg: "80", rep: "10", memo: "" },
    ]);
  });

  it("asTemplate では ID とメモを持たず、日付は当日になる", () => {
    const values = detailToFormValues(detailFixture(), { asTemplate: true });
    expect(values.date).toBe("2026-08-05");
    expect(values.memo).toBe("");

    const exercise = values.exercises[0]!;
    expect(exercise.logId).toBeNull();
    expect(exercise.memo).toBe("");
    expect(exercise.sets.every((set) => set.setId === null)).toBe(true);
    expect(exercise.sets.every((set) => set.memo === "")).toBe(true);
  });

  it("セットが空の種目には空セットを1つ入れる", () => {
    const detail = detailFixture();
    detail.exercises[0]!.exerciseSets.sets = [];
    const values = detailToFormValues(detail);
    expect(values.exercises[0]!.sets).toEqual([
      { setId: null, kg: "", rep: "", memo: "" },
    ]);
  });
});

describe("toCreateTrainingLogInput", () => {
  it("date を含み、数値文字列を数値へ変換する", () => {
    const input = toCreateTrainingLogInput(validValues);
    expect(input.date).toBe("2026-08-01");
    expect(input.bodyWeight).toBe(72.5);
    expect(input.exercises[0]).toMatchObject({
      exerciseId: "exercise-1",
      rest: 90,
      sets: [{ kg: 100, rep: 5, memo: "" }],
    });
  });

  it("未入力セットは除外し、空文字は null にする", () => {
    const values: TrainingLogFormValues = {
      ...validValues,
      bodyWeight: "",
      exercises: [
        {
          ...validValues.exercises[0]!,
          rest: "",
          sets: [
            { setId: null, kg: "100", rep: "5", memo: "" },
            { setId: null, kg: "", rep: "", memo: "" },
          ],
        },
      ],
    };
    const input = toCreateTrainingLogInput(values);
    expect(input.bodyWeight).toBeNull();
    expect(input.exercises[0]!.rest).toBeNull();
    expect(input.exercises[0]!.sets).toHaveLength(1);
  });
});

describe("toUpdateTrainingLogInput", () => {
  it("既存要素にだけ logId / setId を付与する", () => {
    const values: TrainingLogFormValues = {
      ...validValues,
      exercises: [
        {
          logId: "log-1",
          exerciseId: "exercise-1",
          exerciseName: "ベンチプレス",
          rest: "90",
          memo: "",
          sets: [
            { setId: "set-1", kg: "100", rep: "5", memo: "" },
            { setId: null, kg: "80", rep: "10", memo: "" },
          ],
        },
        {
          logId: null,
          exerciseId: "exercise-2",
          exerciseName: "スクワット",
          rest: "",
          memo: "",
          sets: [{ setId: null, kg: "120", rep: "8", memo: "" }],
        },
      ],
    };
    const input = toUpdateTrainingLogInput(values);
    expect(input.exercises[0]!.logId).toBe("log-1");
    expect(input.exercises[0]!.sets[0]).toMatchObject({ setId: "set-1" });
    expect(input.exercises[0]!.sets[1]).not.toHaveProperty("setId");
    expect(input.exercises[1]).not.toHaveProperty("logId");
  });

  it("更新入力には date を含めない (日付の変更は未対応)", () => {
    expect(toUpdateTrainingLogInput(validValues)).not.toHaveProperty("date");
  });
});
