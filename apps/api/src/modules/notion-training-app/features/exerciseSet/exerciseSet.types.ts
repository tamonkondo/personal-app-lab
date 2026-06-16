import {
  NotionPageResults,
  NotionProp,
} from "@/integrations/notion/notion.types";

type NotionExerciseSetWeightProperties = {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
  memo: NotionProp<"memo", "rich_text">;
  detailFormula: NotionProp<"detailFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
  exerciseLogsRelation: NotionProp<"exerciseLogsRelation", "relation">;
  exerciseNameRollup: NotionProp<"exerciseNameRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  createdTime: NotionProp<"createdTime", "created_time">;
  rmTypeRollup: NotionProp<"rmTypeRollup", "rollup">;
};

export type NotionExerciseSetWeightPage =
  NotionPageResults<NotionExerciseSetWeightProperties>;
