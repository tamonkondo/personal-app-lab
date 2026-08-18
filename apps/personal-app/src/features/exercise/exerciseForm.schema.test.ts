import { describe, expect, it } from "vitest";
import type { ExerciseDetail } from "@repo/types/notion-training-app";
import {
  detailToExerciseFormValues,
  emptyExerciseFormValues,
  exerciseFormSchema,
  toExerciseInput,
  type ExerciseFormValues,
} from "./exerciseForm.schema";

const validValues: ExerciseFormValues = {
  name: "ベンチプレス",
  musclesTypes: [{ label: "胸", value: "chest" }],
  rest: "90",
  rmType: "upperBody",
};

const detailFixture = (
  overrides?: Partial<ExerciseDetail>,
): ExerciseDetail => ({
  id: "exercise-1",
  exerciseName: "ベンチプレス",
  latestTrainingDate: "2026-07-20",
  musclesTypes: ["chest"],
  rmTypes: "upperBody",
  trainingName: "ベンチプレス",
  maxGoalWeight: 110,
  currentMaxWeight: 100,
  totalSetsCount: 10,
  totalTrainingDays: 5,
  totalTrainingVolumeWeight: 10000,
  rest: 90,
  ...overrides,
});

describe("exerciseFormSchema", () => {
  it("正しい入力を受け付ける", () => {
    expect(exerciseFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("種目名は空白のみを拒否する", () => {
    expect(
      exerciseFormSchema.safeParse({ ...validValues, name: "  " }).success,
    ).toBe(false);
  });

  it("rest は空文字か数値文字列のみ許可する", () => {
    expect(
      exerciseFormSchema.safeParse({ ...validValues, rest: "" }).success,
    ).toBe(true);
    expect(
      exerciseFormSchema.safeParse({ ...validValues, rest: "abc" }).success,
    ).toBe(false);
  });

  it("rmType は enum か空文字のみ許可する", () => {
    expect(
      exerciseFormSchema.safeParse({ ...validValues, rmType: "" }).success,
    ).toBe(true);
    expect(
      exerciseFormSchema.safeParse({ ...validValues, rmType: "fullBody" })
        .success,
    ).toBe(false);
  });
});

describe("detailToExerciseFormValues", () => {
  it("部位は BODY_PARTS の value / label どちらでも Option へ解決する", () => {
    const values = detailToExerciseFormValues(
      detailFixture({ musclesTypes: ["chest", "肩", "unknown-part"] }),
    );
    expect(values.musclesTypes).toEqual([
      { label: "胸", value: "chest" },
      { label: "肩", value: "shoulder" },
      // 未知の部位はそのまま Option 化する
      { label: "unknown-part", value: "unknown-part" },
    ]);
  });

  it("exerciseName が空なら trainingName を使う", () => {
    const values = detailToExerciseFormValues(
      detailFixture({ exerciseName: "", trainingName: "スクワット" }),
    );
    expect(values.name).toBe("スクワット");
  });

  it("rest / rmTypes の null は空文字にする", () => {
    const values = detailToExerciseFormValues(
      detailFixture({ rest: null, rmTypes: null }),
    );
    expect(values.rest).toBe("");
    expect(values.rmType).toBe("");
  });
});

describe("emptyExerciseFormValues", () => {
  it("rest は既定 90 秒で初期化する", () => {
    expect(emptyExerciseFormValues()).toEqual({
      name: "",
      musclesTypes: [],
      rest: "90",
      rmType: "",
    });
  });
});

describe("toExerciseInput", () => {
  it("フォーム値を API 入力へ変換する (name trim / Option → value)", () => {
    expect(
      toExerciseInput({
        ...validValues,
        name: " ベンチプレス ",
        musclesTypes: [
          { label: "胸", value: "chest" },
          { label: "肩", value: "shoulder" },
        ],
      }),
    ).toEqual({
      name: "ベンチプレス",
      musclesTypes: ["chest", "shoulder"],
      rmTypes: "upperBody",
      rest: 90,
    });
  });

  it("未設定の rmType / rest は null にする", () => {
    expect(
      toExerciseInput({ ...validValues, rmType: "", rest: " " }),
    ).toMatchObject({ rmTypes: null, rest: null });
  });
});
