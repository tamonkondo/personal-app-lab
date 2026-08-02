import { describe, expect, it } from "vitest";
import {
  createTrainingLogSchema,
  updateTrainingLogSchema,
} from "@repo/schemas/notion-training-app";

describe("createTrainingLogSchema", () => {
  const validInput = {
    exercises: [
      {
        exerciseId: "exercise-1",
        sets: [{ kg: "100", rep: "5" }],
      },
    ],
  };

  it("フォーム入力 (文字列) の kg / rep を数値へ coerce する", () => {
    const parsed = createTrainingLogSchema.parse(validInput);
    expect(parsed.exercises[0]?.sets[0]).toEqual({
      kg: 100,
      rep: 5,
      memo: "",
    });
  });

  it("bodyWeight / memo / rest は省略時デフォルトが入る", () => {
    const parsed = createTrainingLogSchema.parse(validInput);
    expect(parsed.bodyWeight).toBeNull();
    expect(parsed.memo).toBe("");
    expect(parsed.exercises[0]?.rest).toBeNull();
  });

  it("種目 0 件 / セット 0 件は拒否する", () => {
    expect(
      createTrainingLogSchema.safeParse({ exercises: [] }).success,
    ).toBe(false);
    expect(
      createTrainingLogSchema.safeParse({
        exercises: [{ exerciseId: "exercise-1", sets: [] }],
      }).success,
    ).toBe(false);
  });

  it("rep は整数のみ受け付ける", () => {
    expect(
      createTrainingLogSchema.safeParse({
        exercises: [
          { exerciseId: "exercise-1", sets: [{ kg: 100, rep: 5.5 }] },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("updateTrainingLogSchema", () => {
  it("logId / setId 付き (既存) と無し (新規) が混在できる", () => {
    const parsed = updateTrainingLogSchema.parse({
      bodyWeight: 72,
      memo: "更新",
      exercises: [
        {
          logId: "log-1",
          exerciseId: "exercise-1",
          rest: 90,
          sets: [
            { setId: "set-1", kg: 100, rep: 5 },
            { kg: 90, rep: 8 }, // 新規セット
          ],
        },
        {
          // 新規種目 (logId なし)
          exerciseId: "exercise-2",
          sets: [{ kg: 60, rep: 10 }],
        },
      ],
    });

    expect(parsed.exercises[0]?.logId).toBe("log-1");
    expect(parsed.exercises[0]?.sets[0]?.setId).toBe("set-1");
    expect(parsed.exercises[0]?.sets[1]?.setId).toBeUndefined();
    expect(parsed.exercises[1]?.logId).toBeUndefined();
  });

  it("exerciseId は必須", () => {
    expect(
      updateTrainingLogSchema.safeParse({
        exercises: [{ sets: [{ kg: 100, rep: 5 }] }],
      }).success,
    ).toBe(false);
  });

  it("種目 0 件は拒否する (全削除は削除 API を使う)", () => {
    expect(
      updateTrainingLogSchema.safeParse({ exercises: [] }).success,
    ).toBe(false);
  });

  it("kg / rep は文字列からも coerce される", () => {
    const parsed = updateTrainingLogSchema.parse({
      exercises: [
        {
          exerciseId: "exercise-1",
          sets: [{ setId: "set-1", kg: "82.5", rep: "6" }],
        },
      ],
    });
    expect(parsed.exercises[0]?.sets[0]).toMatchObject({ kg: 82.5, rep: 6 });
  });
});
