import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type ExerciseProperties = {
  name: NotionProp<"name", "title">;
  maxGoalWeightFormula: NotionProp<"maxGoalWeightFormula", "formula">;
  currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
  maxGoalStatusFormula: NotionProp<"maxGoalStatusFormula", "formula">;
  musclesTypes: NotionProp<"musclesTypes", "multi_select">;
  rest: NotionProp<"rest", "number">;
  maxGoalWeightRollup: NotionProp<"maxGoalWeight", "rollup">;
  maxWeightDateFormula: NotionProp<"maxWeightDateFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
  maxLogsDetailsFormula: NotionProp<"maxLogsDetailsFormula", "formula">;
  theGoalsWeightRelation: NotionProp<"theGoalsWeightRelation", "relation">;
  maxWeightExerciseId: NotionProp<"maxWeightExerciseId", "formula">;
  latestExerciseId: NotionProp<"latestExerciseId", "formula">;
};
export type Exercise = BasePageMeta & {
  properties: ExerciseProperties;
};

export type ExerciseData = NotionResults<Exercise>;
export type ExerciseResponse = {
  id: string;
  name: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  maxGoalStatus: string;
  musclesTypes: string[];
};

export type ExerciseDetail = BasePageMeta & {
  properties: Exercise["properties"] & {
    maxLogsDetailsFormula: NotionProp<"maxLogsDetailsFormula", "formula">;
    trainingRecordRelation: NotionProp<"trainingRecordRelation", "relation">;
    theGoalsWeightRelation: NotionProp<"theGoalsWeightRelation", "relation">;
  };
};
export type ExerciseDetailResponse = {
  id: string;
  name: string;
  maxGoalWeight: number;
  currentMaxWeight: number;
  maxGoalStatus: string;
  musclesTypes: string[];
  trainingRecordIds: string[];
  theGoalsWeightId: string | null;
};
