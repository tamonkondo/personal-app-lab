import { describe, expect, it } from "vitest";
import { parseExerciseSetsText } from "./exerciseSet.lib";

/**
 * setsJsonFormula の生テキスト → ExerciseSetBase[] 変換のテスト。
 * 形式: "[kg|rep|memo|_|maxWeight|id|pageName;;,kg|..." (行区切り ";;"、行頭に "," が付くことがある)
 */
describe("parseExerciseSetsText", () => {
  it("null / undefined / 空文字は空配列を返す", () => {
    expect(parseExerciseSetsText(null)).toEqual([]);
    expect(parseExerciseSetsText(undefined)).toEqual([]);
    expect(parseExerciseSetsText("")).toEqual([]);
  });

  it("1行をパースして各フィールドを取り出す", () => {
    const result = parseExerciseSetsText(
      "[100|5|フォーム意識|x|110|set-id-1|1__20260801__ベンチプレス]",
      "log-1",
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      exerciseId: "log-1",
      id: "set-id-1",
      kg: 100,
      rep: 5,
      memo: "フォーム意識",
      maxWeight: 110,
      notionUrl:
        "https://app.notion.com/p/1__20260801__ベンチプレス-set-id-1",
    });
  });

  it("複数行 (;;区切り・行頭カンマ) をパースする", () => {
    const result = parseExerciseSetsText(
      "[100|5||x|110|id1|p1;;,80|10||x|110|id2|p2]",
      "log-1",
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ kg: 100, rep: 5, id: "id1" });
    expect(result[1]).toMatchObject({ kg: 80, rep: 10, id: "id2" });
  });

  it("数値でない kg / rep / maxWeight は 0 にフォールバックする", () => {
    const result = parseExerciseSetsText("[abc|def||x|ghi|id1|p1]", "log-1");
    expect(result[0]).toMatchObject({ kg: 0, rep: 0, maxWeight: 0 });
  });

  it("exerciseLogId 未指定時は exerciseId が空文字になる", () => {
    const result = parseExerciseSetsText("[60|8||x|60|id1|p1]");
    expect(result[0]?.exerciseId).toBe("");
  });
});
