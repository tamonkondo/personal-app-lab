// trainingLogTypes.ts
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BasePageMeta } from "@/integrations/notion/notion.types";

type PropsOf<P extends PageObjectResponse> = P["properties"];

/**
 * このDBの properties 部分の「Notionの生型」
 * （公式型をベースにして、欲しいプロパティだけ取り出す）
 */
export type TrainingLog = BasePageMeta & {
  properties: {
    memo: Extract<PropsOf<PageObjectResponse>["memo"], { type: "rich_text" }>;
    trainingExercisesRelation: Extract<
      PropsOf<PageObjectResponse>["trainingExercisesRelation"],
      { type: "relation" }
    >;
    createdTime: Extract<
      PropsOf<PageObjectResponse>["createdTime"],
      { type: "created_time" }
    >;
    bodyWeight: Extract<
      PropsOf<PageObjectResponse>["bodyWeight"],
      { type: "number" }
    >;
    name: Extract<PropsOf<PageObjectResponse>["name"], { type: "title" }>;
  };
};
export type ExerciseLog = BasePageMeta & {
  properties: {
    todayMaxWeightRollup: Extract<
      PropsOf<PageObjectResponse>["todayMaxWeightRollup"],
      { type: "rollup" }
    >;
    trainingNameFormula: Extract<
      PropsOf<PageObjectResponse>["trainingNameFormula"],
      { type: "formula" }
    >;
    exerciseDetailLogsRelation: Extract<
      PropsOf<PageObjectResponse>["exerciseDetailLogsRelation"],
      { type: "relation" }
    >;
    rest: Extract<PropsOf<PageObjectResponse>["rest"], { type: "number" }>;
    memo: Extract<PropsOf<PageObjectResponse>["memo"], { type: "rich_text" }>;
  };
};
export type ExerciseDetailLog = BasePageMeta & {
  properties: {
    kg: Extract<PropsOf<PageObjectResponse>["kg"], { type: "number" }>;
    rep: Extract<PropsOf<PageObjectResponse>["rep"], { type: "number" }>;
    memo: Extract<PropsOf<PageObjectResponse>["memo"], { type: "rich_text" }>;
    detailFormula: Extract<
      PropsOf<PageObjectResponse>["detailFormula"],
      { type: "formula" }
    >;
    maxWeightFormula: Extract<
      PropsOf<PageObjectResponse>["maxWeightFormula"],
      { type: "formula" }
    >;
    createdTime: Extract<
      PropsOf<PageObjectResponse>["createdTime"],
      { type: "created_time" }
    >;
  };
};

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
