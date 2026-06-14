import {
  BasePageMeta,
  NotionPageResults,
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
  maxGoalWeightRollup: NotionProp<"maxGoalWeightRollup", "rollup">;
  maxWeightDateFormula: NotionProp<"maxWeightDateFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
  maxLogsDetailsFormula: NotionProp<"maxLogsDetailsFormula", "formula">;
  theGoalsWeightRelation: NotionProp<"theGoalsWeightRelation", "relation">;
  maxWeightExerciseLogId: NotionProp<"maxWeightExerciseLogId", "formula">;
  latestExerciseLogId: NotionProp<"latestExerciseLogId", "formula">;
};
export type Exercise = BasePageMeta & {
  properties: ExerciseProperties;
};

export type ExtractExercise<T extends keyof ExerciseProperties> =
  BasePageMeta & {
    properties: Pick<ExerciseProperties, T>;
  };

export type ExerciseData = NotionResults<Exercise>;
export type ExtractExerciseData<T extends keyof ExerciseProperties> =
  NotionResults<ExtractExercise<T>>;
export type ExtractExercisePageData<T extends keyof ExerciseProperties> =
  NotionPageResults<T>;

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
