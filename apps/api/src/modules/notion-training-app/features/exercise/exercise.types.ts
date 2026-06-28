import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type NotionExerciseProperties = {
  name: NotionProp<"name", "title">;
  maxGoalWeightFormula: NotionProp<"maxGoalWeightFormula", "formula">;
  currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
  maxGoalStatusFormula: NotionProp<"maxGoalStatusFormula", "formula">;
  musclesTypes: NotionProp<"musclesTypes", "multi_select">;
  rest: NotionProp<"rest", "number">;
  maxGoalWeightRollup: NotionProp<"maxGoalWeightRollup", "rollup">;
  maxWeightDateFormula: NotionProp<"maxWeightDateFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
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
export type NotionExercisePage = BasePageMeta & {
  properties: NotionExerciseProperties;
};

export type NotionExerciseQueryResult = NotionResults<NotionExercisePage>;
