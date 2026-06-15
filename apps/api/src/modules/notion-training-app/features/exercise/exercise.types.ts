import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type ExerciseProperties = {
  name: NotionProp<"name", "title">;
  currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
  musclesTypes: NotionProp<"musclesTypes", "multi_select">;
  maxGoalWeightRollup: NotionProp<"maxGoalWeightRollup", "rollup">;
  maxWeightExerciseLogId: NotionProp<"maxWeightExerciseLogId", "formula">;
  latestExerciseLogId: NotionProp<"latestExerciseLogId", "formula">;
};
export type Exercise = BasePageMeta & {
  properties: ExerciseProperties;
};

export type ExerciseData = NotionResults<Exercise>;
