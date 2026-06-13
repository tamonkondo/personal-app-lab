import {
  BasePageMeta,
  NotionPageResults,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type ExerciseSetProperties = {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
  memo: NotionProp<"memo", "rich_text">;
  detailFormula: NotionProp<"detailFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
  exerciseLogsRelation: NotionProp<"exerciseLogsRelation", "relation">;
  exerciseNameRollup: NotionProp<"exerciseNameRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  createdTime: NotionProp<"createdTime", "created_time">;
  rmTypeRollup: NotionProp<"rmTypeRollup", "rollup">;
};
export type ExerciseSet = BasePageMeta & {
  properties: ExerciseSetProperties;
};
export type ExtractExerciseSetLog<T extends keyof ExerciseSetProperties> =
  BasePageMeta & {
    properties: Pick<ExerciseSetProperties, T>;
  };

export type ExerciseDetail = BasePageMeta & {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
  memo: NotionProp<"memo", "rich_text">;
  detailFormula: NotionProp<"detailFormula", "formula">;
  maxWeightFormula: NotionProp<"maxWeightFormula", "formula">;
};

export type ExerciseSetsData = NotionResults<ExerciseSet>;
export type ExerciseSetDetailData = NotionPageResults<ExerciseDetail>;
export type ExerciseSetWeight = Pick<ExerciseDetail, "kg" | "rep">;
export type ExerciseSetWeightData = NotionPageResults<ExerciseSetWeight>;

export type ExerciseSetResponse = {
  id: string;
  kg: number;
  rep: number;
  memo: string;
  detail: string;
  maxWeight: number;
  createdTime: string;
};

export type ExerciseSetsResponse = {
  data: ExerciseSetResponse[];
  next_cursor?: string | undefined;
  has_more: boolean;
};
