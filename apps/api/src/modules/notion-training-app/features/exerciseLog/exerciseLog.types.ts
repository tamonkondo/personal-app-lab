import {
  BasePageMeta,
  NotionPageResults,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type ExerciseLog = BasePageMeta & {
  properties: ExerciseLogDetail;
};

export type ExerciseLogData = NotionResults<ExerciseLog>;

export type ExerciseLogDetail = {
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
};
export type ExerciseLogDetailData = NotionPageResults<ExerciseLog>;
export type ExerciseLogExerciseSetsRelation = Pick<
  ExerciseLog,
  "exerciseSetsRelation"
>;
export type ExerciseLogExerciseSetsRelationData =
  NotionPageResults<ExerciseLogExerciseSetsRelation>;

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

export type ExerciseLogResponse = {
  id: string;
  createdTime: string;
  todayMaxWeight: number;
  trainingName: string;
  rest: number;
  exerciseSets: {
    id: string;
    kg: number;
    rep: number;
    memo: string;
    displayText: string;
    maxWeight: number;
  }[];
};
