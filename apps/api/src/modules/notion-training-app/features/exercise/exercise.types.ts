import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type NotionExerciseProperties = {
  name: NotionProp<"name", "title">;
  currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
  musclesTypes: NotionProp<"musclesTypes", "multi_select">;
  maxGoalWeightRollup: NotionProp<"maxGoalWeightRollup", "rollup">;
  maxWeightExerciseLogId: NotionProp<"maxWeightExerciseLogId", "formula">;
  latestExerciseLogId: NotionProp<"latestExerciseLogId", "formula">;
};
export type NotionExercisePage = BasePageMeta & {
  properties: NotionExerciseProperties;
};

export type NotionExerciseQueryResult = NotionResults<NotionExercisePage>;
