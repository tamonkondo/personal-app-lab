import { BasePageMeta, NotionProp } from "@/integrations/notion/notion.types";

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
