import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type Exercise = BasePageMeta & {
  properties: {
    name: NotionProp<"name", "title">;
    maxGoalWeightFormula: NotionProp<"maxGoalWeightFormula", "formula">;
    currentMaxWeightRollup: NotionProp<"currentMaxWeightRollup", "rollup">;
    maxGoalStatusFormula: NotionProp<"maxGoalStatusFormula", "formula">;
    musclesTypes: NotionProp<"musclesTypes", "multi_select">;
    rest: NotionProp<"rest", "number">;
  };
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
