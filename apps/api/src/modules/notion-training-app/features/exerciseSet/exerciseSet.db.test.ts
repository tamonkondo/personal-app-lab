import { describe, expect, it } from "vitest";
import {
  buildCreateExerciseSetProperties,
  buildUpdateExerciseSetProperties,
} from "./exerciseSet.db";

describe("buildCreateExerciseSetProperties", () => {
  it("name は '<連番>__<YYYYMMDD>__<種目名>' 形式で組み立てる", () => {
    const properties = buildCreateExerciseSetProperties({
      setNumber: 2,
      dateKey: "20260801",
      exerciseName: "ベンチプレス",
      kg: 100,
      rep: 5,
      memo: "",
      exerciseLogId: "log-1",
    });
    expect(properties.name).toEqual({
      title: [{ text: { content: "2__20260801__ベンチプレス" } }],
    });
    expect(properties.kg).toEqual({ number: 100 });
    expect(properties.rep).toEqual({ number: 5 });
    expect(properties.exerciseLogsRelation).toEqual({
      relation: [{ id: "log-1" }],
    });
  });

  it("memo は空のとき送信しない", () => {
    const withoutMemo = buildCreateExerciseSetProperties({
      setNumber: 1,
      dateKey: "20260801",
      exerciseName: "スクワット",
      kg: 80,
      rep: 8,
      memo: "",
      exerciseLogId: "log-1",
    });
    expect(withoutMemo).not.toHaveProperty("memo");

    const withMemo = buildCreateExerciseSetProperties({
      setNumber: 1,
      dateKey: "20260801",
      exerciseName: "スクワット",
      kg: 80,
      rep: 8,
      memo: "深くしゃがむ",
      exerciseLogId: "log-1",
    });
    expect(withMemo.memo).toEqual({
      rich_text: [{ text: { content: "深くしゃがむ" } }],
    });
  });
});

describe("buildUpdateExerciseSetProperties", () => {
  it("kg / rep / memo を置き換える", () => {
    const properties = buildUpdateExerciseSetProperties({
      kg: 90,
      rep: 6,
      memo: "更新メモ",
    });
    expect(properties.kg).toEqual({ number: 90 });
    expect(properties.rep).toEqual({ number: 6 });
    expect(properties.memo).toEqual({
      rich_text: [{ text: { content: "更新メモ" } }],
    });
  });

  it("memo が空文字のときは空配列でクリアする", () => {
    const properties = buildUpdateExerciseSetProperties({
      kg: 90,
      rep: 6,
      memo: "",
    });
    expect(properties.memo).toEqual({ rich_text: [] });
  });

  it("name とリレーションは含めない (維持する)", () => {
    const properties = buildUpdateExerciseSetProperties({
      kg: 90,
      rep: 6,
      memo: "",
    });
    expect(properties).not.toHaveProperty("name");
    expect(properties).not.toHaveProperty("exerciseLogsRelation");
  });
});
