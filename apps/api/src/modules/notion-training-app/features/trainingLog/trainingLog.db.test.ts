import { describe, expect, it } from "vitest";
import {
  buildCreateTrainingLogProperties,
  buildUpdateTrainingLogProperties,
  parseTrainingLogPage,
  parseDetailExerciseLogPage,
  mapTrainingLogDetail,
} from "./trainingLog.db";

/** TRAINING_LOGS の生 Notion ページのフィクスチャ */
const rawTrainingLogPage = (overrides?: {
  bodyWeight?: number | null;
  memo?: string;
  relationIds?: string[];
}) => ({
  id: "training-1",
  url: "https://notion.so/training-1",
  created_time: "2026-08-01T10:00:00.000Z",
  properties: {
    memo: {
      type: "rich_text",
      rich_text:
        overrides?.memo !== undefined && overrides.memo !== ""
          ? [{ plain_text: overrides.memo }]
          : [],
    },
    trainingExercisesRelation: {
      type: "relation",
      relation: (overrides?.relationIds ?? ["log-1"]).map((id) => ({ id })),
    },
    createdTime: {
      type: "created_time",
      created_time: "2026-08-01T10:00:00.000Z",
    },
    bodyWeight: { type: "number", number: overrides?.bodyWeight ?? 72.5 },
    musleTypesFormula: { type: "formula", formula: { string: "胸, 肩" } },
  },
});

/** EXERCISE_LOGS (詳細表示用) の生 Notion ページのフィクスチャ */
const rawDetailExerciseLogPage = (overrides?: {
  id?: string;
  memo?: string;
  setsJson?: string;
  todayMax?: number;
  goal?: number;
}) => ({
  id: overrides?.id ?? "log-1",
  url: "https://notion.so/log-1",
  created_time: "2026-08-01T10:05:00.000Z",
  properties: {
    todayMaxWeightRollup: {
      type: "rollup",
      rollup: { number: overrides?.todayMax ?? 100 },
    },
    trainingNameFormula: { type: "formula", formula: { string: "ベンチプレス" } },
    setsJsonFormula: {
      type: "formula",
      formula: {
        string:
          overrides?.setsJson ??
          "[100|5|メモ1|x|100|set-1|p1;;,80|10||x|100|set-2|p2]",
      },
    },
    muslesTypesRollup: { type: "rollup", rollup: { array: [] } },
    memo: {
      type: "rich_text",
      rich_text:
        overrides?.memo !== undefined && overrides.memo !== ""
          ? [{ plain_text: overrides.memo }]
          : [],
    },
    rest: { type: "number", number: 90 },
    goalWeightRollup: {
      type: "rollup",
      rollup: { number: overrides?.goal ?? 110 },
    },
    exerciseRelation: {
      type: "relation",
      relation: [{ id: "exercise-1" }],
    },
  },
});

describe("buildCreateTrainingLogProperties", () => {
  it("name に日付、bodyWeight / memo は値があるときのみ送信する", () => {
    const full = buildCreateTrainingLogProperties({
      dateName: "2026-08-01",
      bodyWeight: 72.5,
      memo: "調子良い",
    });
    expect(full.name).toEqual({
      title: [{ text: { content: "2026-08-01" } }],
    });
    expect(full.bodyWeight).toEqual({ number: 72.5 });
    expect(full.memo).toEqual({
      rich_text: [{ text: { content: "調子良い" } }],
    });

    const minimal = buildCreateTrainingLogProperties({
      dateName: "2026-08-01",
      bodyWeight: null,
      memo: "",
    });
    expect(minimal).not.toHaveProperty("bodyWeight");
    expect(minimal).not.toHaveProperty("memo");
  });
});

describe("buildUpdateTrainingLogProperties", () => {
  it("bodyWeight / memo を置き換える (null / 空文字はクリア)", () => {
    expect(
      buildUpdateTrainingLogProperties({ bodyWeight: 70, memo: "更新" }),
    ).toEqual({
      bodyWeight: { number: 70 },
      memo: { rich_text: [{ text: { content: "更新" } }] },
    });
    expect(
      buildUpdateTrainingLogProperties({ bodyWeight: null, memo: "" }),
    ).toEqual({
      bodyWeight: { number: null },
      memo: { rich_text: [] },
    });
  });

  it("name (日付) は含めない (当日記録運用のため維持)", () => {
    expect(
      buildUpdateTrainingLogProperties({ bodyWeight: 70, memo: "" }),
    ).not.toHaveProperty("name");
  });
});

describe("parseTrainingLogPage", () => {
  it("生ページをドメイン値へ変換する", () => {
    const page = parseTrainingLogPage(
      rawTrainingLogPage({ memo: "背中の日", relationIds: ["a", "b"] }),
    );
    expect(page.id).toBe("training-1");
    expect(page.properties.memo).toBe("背中の日");
    expect(page.properties.trainingExercisesRelation).toEqual(["a", "b"]);
    expect(page.properties.bodyWeight).toBe(72.5);
    expect(page.properties.musleTypesFormula).toBe("胸, 肩");
  });

  it("プロパティ型が変わったら ZodError で検出する (スキーマ変更検知)", () => {
    const broken = rawTrainingLogPage();
    // bodyWeight が number → rich_text に変わったケース
    (broken.properties as Record<string, unknown>).bodyWeight = {
      type: "rich_text",
      rich_text: [],
    };
    expect(() => parseTrainingLogPage(broken)).toThrow();
  });
});

describe("mapTrainingLogDetail", () => {
  it("種目ログの memo / セット集計値を含む詳細へ変換する", () => {
    const trainingLog = parseTrainingLogPage(
      rawTrainingLogPage({ memo: "胸の日" }),
    );
    const exerciseLog = parseDetailExerciseLogPage(
      rawDetailExerciseLogPage({ memo: "フォーム意識" }),
    );

    const detail = mapTrainingLogDetail(trainingLog, [exerciseLog]);

    expect(detail.id).toBe("training-1");
    expect(detail.memo).toBe("胸の日");
    expect(detail.bodyParts).toEqual(["胸", "肩"]);
    expect(detail.totalExerciseCount).toBe(1);
    // セット: 100kg×5 + 80kg×10 = 1300kg
    expect(detail.totalSetsCount).toBe(2);
    expect(detail.totalTrainingVolumeWeight).toBe(1300);

    const exercise = detail.exercises[0]!;
    expect(exercise.trainingName).toBe("ベンチプレス");
    expect(exercise.memo).toBe("フォーム意識");
    expect(exercise.exerciseSets.exerciseId).toBe("exercise-1");
    expect(exercise.exerciseSets.sets.map((set) => set.id)).toEqual([
      "set-1",
      "set-2",
    ]);
  });

  it("todayMax と goal が一致したら isPr になる", () => {
    const trainingLog = parseTrainingLogPage(rawTrainingLogPage());
    const prLog = parseDetailExerciseLogPage(
      rawDetailExerciseLogPage({ todayMax: 110, goal: 110 }),
    );
    const detail = mapTrainingLogDetail(trainingLog, [prLog]);
    expect(detail.exercises[0]?.isPr).toBe(true);
  });
});
