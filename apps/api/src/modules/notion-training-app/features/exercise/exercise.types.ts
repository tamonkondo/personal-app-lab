import { NotionProp } from "@/integrations/notion/notion.types";

/**
 * EXERCISES DB のプロパティ定義 (プロパティ名と型のカタログ)。
 * filter_properties リストや filter のプロパティ名参照 (exerciseProp) の型付けに使う。
 * ページの実際の読み取りは exercise.db.ts の zod スキーマが行う。
 */
export type NotionExerciseProperties = {
  name: NotionProp<"name", "title">;
  currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
  maxGoalStatusFormula: NotionProp<"maxGoalStatusFormula", "formula">;
  musclesTypes: NotionProp<"musclesTypes", "multi_select">;
  rmTypes: NotionProp<"rmTypes", "select">;
  rest: NotionProp<"rest", "number">;
  maxGoalWeightRollup: NotionProp<"maxGoalWeightRollup", "rollup">;
  maxWeightDateFormula: NotionProp<"maxWeightDateFormula", "formula">;
  maxLogsDetailsFormula: NotionProp<"maxLogsDetailsFormula", "formula">;
  theGoalsWeightRelation: NotionProp<"theGoalsWeightRelation", "relation">;
  maxWeightExerciseLogId: NotionProp<"maxWeightExerciseLogId", "formula">;
  latestExerciseLogId: NotionProp<"latestExerciseLogId", "formula">;
  totalSetsCountFormula: NotionProp<"totalSetsCountFormula", "formula">;
  totalTrainingDaysFormula: NotionProp<"totalTrainingDaysFormula", "formula">;
  totalTrainingVolumeWeightFormula: NotionProp<
    "totalTrainingVolumeWeightFormula",
    "formula"
  >;
  latestTrainingDateFormula: NotionProp<"latestTrainingDateFormula", "formula">;
};
