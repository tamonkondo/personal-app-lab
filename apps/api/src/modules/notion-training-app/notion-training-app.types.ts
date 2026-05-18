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
