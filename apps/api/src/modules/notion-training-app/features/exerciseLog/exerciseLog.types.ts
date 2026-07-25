import { NotionProp } from "@/integrations/notion/notion.types";

/**
 * EXERCISE_LOGS DB のプロパティ定義 (プロパティ名と型のカタログ)。
 * filter_properties リストや filter のプロパティ名参照 (exerciseLogProp) の型付けに使う。
 * ページの実際の読み取りは exerciseLog.db.ts / trainingLog.db.ts の zod スキーマが行う。
 */
export interface NotionExerciseLogProperties {
  todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  exerciseSetsRelation: NotionProp<"exerciseSetsRelation", "relation">;
  setsJsonFormula: NotionProp<"setsJsonFormula", "formula">;
  rest: NotionProp<"rest", "number">;
  memo: NotionProp<"memo", "rich_text">;
  trainingExercisesRelation: NotionProp<
    "trainingExercisesRelation",
    "relation"
  >;
  createdTime: NotionProp<"createdTime", "created_time">;
  bodyWeight: NotionProp<"bodyWeight", "number">;
  name: NotionProp<"name", "title">;
  goalWeightRollup: NotionProp<"goalWeightRollup", "rollup">;
  todayMaxWeightFormula: NotionProp<"todayMaxWeightFormula", "formula">;
  rmTypeFormula: NotionProp<"rmTypeFormula", "formula">;
  rmTypeRollup: NotionProp<"rmTypeRollup", "rollup">;
  maxDetailsRollup: NotionProp<"maxDetailsRollup", "rollup">;
  createdDate: NotionProp<"createdDate", "created_time">;
  setName: NotionProp<"setName", "button">;
  relatedBackToExerciseLogs: NotionProp<
    "relatedBackToExerciseLogs",
    "relation"
  >;
  theGoalWeightRelation: NotionProp<"theGoalWeightRelation", "relation">;
  exerciseRelation: NotionProp<"exerciseRelation", "relation">;
  trainingRecordRelation: NotionProp<"trainingRecordRelation", "relation">;
  muslesTypesRollup: NotionProp<"muslesTypesRollup", "rollup">;
}
