/**
 * 型定義ルール
 * 〇〇：Notion APIから取得したデータの1件分の型
 * 〇〇Data: Notion APIから取得した生のデータの型
 * 〇〇Response: クライアントに返すレスポンスの型
 * */ 
// trainingLogTypes.ts
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BasePageMeta } from "@/integrations/notion/notion.types";

type PropsOf<P extends PageObjectResponse> = P["properties"];
type PageProps = PropsOf<PageObjectResponse>;
type NotionProp<
  Name extends keyof PageProps,
  Kind extends PageProps[Name]["type"],
> = Extract<PageProps[Name], { type: Kind }>;
type NotionResults<T> = {
  object: string;
  results: T[];
};
export type TrainingLog = BasePageMeta & {
  properties: {
    memo: NotionProp<"memo", "rich_text">;
    trainingExercisesRelation: NotionProp<
      "trainingExercisesRelation",
      "relation"
    >;
    createdTime: NotionProp<"createdTime", "created_time">;
    bodyWeight: NotionProp<"bodyWeight", "number">;
    name: NotionProp<"name", "title">;
  };
};
export type TrainingLogData = NotionResults<TrainingLog>;
export type TrainingLogResponse = {
  createdTime: string;
  bodyWeight: number | null;
  memo: string;
  exercises: {
    name: string | null;
    todayMaxWeight: number | null;
    rest: number | null;
    memo: string;
    sets: {
      kg: number;
      rep: number;
      memo: string;
      detailFormula: string;
      createdTime: string;
    }[];
  }[];
};
export type ExerciseLog = BasePageMeta & {
  properties: {
    todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
    trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
    exerciseDetailLogsRelation: NotionProp<
      "exerciseDetailLogsRelation",
      "relation"
    >;
    rest: NotionProp<"rest", "number">;
    memo: NotionProp<"memo", "rich_text">;
  };
};
export type ExerciseDetailLog = BasePageMeta & {
  properties: {
    kg: NotionProp<"kg", "number">;
    rep: NotionProp<"rep", "number">;
    memo: NotionProp<"memo", "rich_text">;
    detailFormula: NotionProp<"detailFormula", "formula">;
    maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
    createdTime: NotionProp<"createdTime", "created_time">;
  };
};

export type GoalWeight = BasePageMeta & {
  properties: {
    exerciseNameFormula: NotionProp<"exerciseNameFormula", "rich_text">;
    maxWeightRollup: NotionProp<"maxWeightRollup", "rollup">;
    updateDateRollup: NotionProp<"updateDateRollup", "rollup">;
    goalWeight: NotionProp<"goalWeight", "number">;
    statusFormula: NotionProp<"statusFormula", "formula">;
  };
};

export type GoalWeightData = NotionResults<GoalWeight>;

export type GoalWeightResponse = {
  id: string;
  exerciseName: string;
  maxWeight: number;
  updateDate: string | undefined;
  goalWeight: number;
  status: string;
};
