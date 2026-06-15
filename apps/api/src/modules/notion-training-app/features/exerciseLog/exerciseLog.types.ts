import {
  BasePageMeta,
  NotionProp,
} from "@/integrations/notion/notion.types";

export interface NotionExerciseLogProperties {
  todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  exerciseSetsRelation: NotionProp<"exerciseSetsRelation", "relation">;
  setsJsonFormula: NotionProp<"setsJsonFormula", "formula">;
  rest: NotionProp<"rest", "number">;
  memo: NotionProp<"memo", "rich_text">;
}

export type NotionExerciseLogPage<
  T extends keyof NotionExerciseLogProperties,
> =
  BasePageMeta & {
    properties: Pick<NotionExerciseLogProperties, T>;
  };
