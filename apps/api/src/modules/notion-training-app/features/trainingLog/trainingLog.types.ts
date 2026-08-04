import { NotionProp } from "@/integrations/notion/notion.types";

/**
 * TRAINING_LOGS DB のプロパティ定義 (プロパティ名と型のカタログ)。
 * filter のプロパティ名参照 (trainingLogProp) の型付けに使う。
 * ページの実際の読み取りは trainingLog.db.ts の zod スキーマが行う。
 */
export type NotionTrainingLogProperties = {
  name: NotionProp<"name", "title">;
  memo: NotionProp<"memo", "rich_text">;
  trainingExercisesRelation: NotionProp<
    "trainingExercisesRelation",
    "relation"
  >;
  createdTime: NotionProp<"createdTime", "created_time">;
  /** 記録日。過去日付の記録に対応するため created_time とは別に持つ */
  date: NotionProp<"date", "date">;
  bodyWeight: NotionProp<"bodyWeight", "number">;
  exerciseRollup: NotionProp<"exerciseRollup", "rollup">;
  musleTypesFormula: NotionProp<"musleTypesFormula", "formula">;
  musleTypesFormulaWrapper: NotionProp<"musleTypesFormulaWrapper", "formula">;
};
