import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type ExerciseLog = BasePageMeta & {
  properties: {
    todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
    trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
    exerciseSetsRelation: NotionProp<"exerciseSetsRelation", "relation">;
    rest: NotionProp<"rest", "number">;
    memo: NotionProp<"memo", "rich_text">;
  };
};

export type ExerciseLogData = NotionResults<ExerciseLog> & {
  next_cursor: string | undefined;
  has_more: boolean;
};

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
    reps: number;
    memo: string;
    detail: string;
    maxWeight: number;
  }[];
};
