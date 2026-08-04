import { describe, expect, it } from "vitest";
import {
  buildCreateExerciseLogProperties,
  buildUpdateExerciseLogProperties,
} from "./exerciseLog.db";

describe("buildCreateExerciseLogProperties", () => {
  const baseInput = {
    recordNumber: 3,
    exerciseName: "ベンチプレス",
    date: "2026-08-01",
    rest: 90,
    memo: "",
    exerciseId: "exercise-1",
    trainingLogId: "training-1",
  };

  it("name は 'record__<連番>__<種目名>' 形式で組み立てる", () => {
    const properties = buildCreateExerciseLogProperties(baseInput);
    expect(properties.name).toEqual({
      title: [{ text: { content: "record__3__ベンチプレス" } }],
    });
  });

  it("記録日を date プロパティに設定する", () => {
    const properties = buildCreateExerciseLogProperties(baseInput);
    expect(properties.date).toEqual({ date: { start: "2026-08-01" } });
  });

  it("種目・トレーニングログへのリレーションを張る", () => {
    const properties = buildCreateExerciseLogProperties(baseInput);
    expect(properties.exerciseRelation).toEqual({
      relation: [{ id: "exercise-1" }],
    });
    expect(properties.trainingRecordRelation).toEqual({
      relation: [{ id: "training-1" }],
    });
  });

  it("rest が null / memo が空のときは送信しない", () => {
    const properties = buildCreateExerciseLogProperties({
      ...baseInput,
      rest: null,
      memo: "",
    });
    expect(properties).not.toHaveProperty("rest");
    expect(properties).not.toHaveProperty("memo");
  });

  it("rest / memo があるときは送信する", () => {
    const properties = buildCreateExerciseLogProperties({
      ...baseInput,
      rest: 120,
      memo: "補助あり",
    });
    expect(properties.rest).toEqual({ number: 120 });
    expect(properties.memo).toEqual({
      rich_text: [{ text: { content: "補助あり" } }],
    });
  });
});

describe("buildUpdateExerciseLogProperties", () => {
  it("rest / memo を置き換える (null / 空文字はクリア)", () => {
    expect(
      buildUpdateExerciseLogProperties({ rest: 60, memo: "更新" }),
    ).toEqual({
      rest: { number: 60 },
      memo: { rich_text: [{ text: { content: "更新" } }] },
    });
    expect(buildUpdateExerciseLogProperties({ rest: null, memo: "" })).toEqual(
      {
        rest: { number: null },
        memo: { rich_text: [] },
      },
    );
  });

  it("name とリレーションは含めない (維持する)", () => {
    const properties = buildUpdateExerciseLogProperties({
      rest: 60,
      memo: "",
    });
    expect(properties).not.toHaveProperty("name");
    expect(properties).not.toHaveProperty("exerciseRelation");
    expect(properties).not.toHaveProperty("trainingRecordRelation");
  });
});
