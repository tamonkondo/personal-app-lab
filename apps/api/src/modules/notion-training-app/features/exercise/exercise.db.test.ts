import { describe, expect, it } from "vitest";
import { buildExerciseTrendPoints, trendPeriodStart } from "./exercise.db";
import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";

const logFixture = (
  overrides: Partial<Omit<ExerciseLogWithSetsItemResponse, "sets">> & {
    sets?: { kg: number; rep: number }[];
  },
): ExerciseLogWithSetsItemResponse => ({
  exerciseLogId: overrides.exerciseLogId ?? "log-1",
  exerciseId: "exercise-1",
  createdTime: overrides.createdTime ?? "2026-08-01T10:00:00.000Z",
  rest: 90,
  trainingName: "ベンチプレス",
  notionUrl: "",
  sets: (overrides.sets ?? [{ kg: 100, rep: 5 }]).map((set, index) => ({
    exerciseId: "log-1",
    id: `set-${index}`,
    kg: set.kg,
    rep: set.rep,
    maxWeight: 0,
    memo: "",
    notionUrl: "",
  })),
});

describe("trendPeriodStart", () => {
  const now = new Date("2026-08-02T00:00:00.000Z");

  it("期間に応じた開始日時 (ISO) を返す", () => {
    expect(trendPeriodStart("1w", now)).toBe("2026-07-26T00:00:00.000Z");
    expect(trendPeriodStart("2w", now)).toBe("2026-07-19T00:00:00.000Z");
    expect(trendPeriodStart("4w", now)).toBe("2026-07-05T00:00:00.000Z");
    expect(trendPeriodStart("1y", now)).toBe("2025-08-02T00:00:00.000Z");
  });

  it("all は null (期間フィルタなし)", () => {
    expect(trendPeriodStart("all", now)).toBeNull();
  });
});

describe("buildExerciseTrendPoints", () => {
  it("1ログ = 1点でトップセット重量・ボリューム・セット数を集計する", () => {
    const points = buildExerciseTrendPoints([
      logFixture({
        exerciseLogId: "log-1",
        sets: [
          { kg: 100, rep: 5 },
          { kg: 90, rep: 8 },
        ],
      }),
    ]);
    expect(points).toEqual([
      {
        exerciseLogId: "log-1",
        date: "2026-08-01T10:00:00.000Z",
        maxWeight: 100,
        totalVolume: 100 * 5 + 90 * 8,
        setsCount: 2,
      },
    ]);
  });

  it("日付昇順に並べ、セット 0 件のログは除外する", () => {
    const points = buildExerciseTrendPoints([
      logFixture({
        exerciseLogId: "newer",
        createdTime: "2026-08-01T00:00:00.000Z",
      }),
      logFixture({
        exerciseLogId: "empty",
        createdTime: "2026-07-20T00:00:00.000Z",
        sets: [],
      }),
      logFixture({
        exerciseLogId: "older",
        createdTime: "2026-07-01T00:00:00.000Z",
      }),
    ]);
    expect(points.map((point) => point.exerciseLogId)).toEqual([
      "older",
      "newer",
    ]);
  });
});
