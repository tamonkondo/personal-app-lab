import { NotionProp } from "@/integrations/notion/notion.types";

/**
 * EXERCISE_SETS DB のプロパティ定義 (プロパティ名と型のカタログ)。
 * filter_properties リストの型付けに使う。
 * ページの実際の読み取りは trainingLog.db.ts の zod スキーマが行う。
 */
export type NotionExerciseSetWeightProperties = {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
  memo: NotionProp<"memo", "rich_text">;
  detailFormula: NotionProp<"detailFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
  exerciseLogsRelation: NotionProp<"exerciseLogsRelation", "relation">;
  exerciseNameRollup: NotionProp<"exerciseNameRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  createdTime: NotionProp<"createdTime", "created_time">;
  trainingVolumeWeightFormula: NotionProp<
    "trainingVolumeWeightFormula",
    "formula"
  >;
  rmTypeRollup: NotionProp<"rmTypeRollup", "rollup">;
};
