import {
  BasePageMeta,
  NotionPageResults,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export interface ExerciseLogProperties {
  todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  exerciseSetsRelation: NotionProp<"exerciseSetsRelation", "relation">;
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
  trainingExerciseRelation: NotionProp<"trainingExerciseRelation", "relation">;
  trainingRecordRelation: NotionProp<"trainingRecordRelation", "relation">;
}

export type ExerciseLog = BasePageMeta & {
  properties: ExerciseLogProperties;
};

export type ExtractExerciseLog<T extends keyof ExerciseLogProperties> =
  BasePageMeta & {
    properties: Pick<ExerciseLogProperties, T>;
  };

export type ExerciseLogData = NotionResults<ExerciseLog>;

export type ExerciseLogDetailData = NotionPageResults<ExerciseLog>;

export type ExerciseLogsResponse = {
  next_cursor: string | undefined;
  has_more: boolean;
  data: {
    id: string;
    createdTime: string;
    todayMaxWeight: number;
    trainingName: string;
    exerciseSetsIds: string[];
    rest: number;
  }[];
};

