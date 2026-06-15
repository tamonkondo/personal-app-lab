import {
  BasePageMeta,
  NotionProp,
} from "@/integrations/notion/notion.types";

export interface ExerciseLogProperties {
  todayMaxWeightRollup: NotionProp<"todayMaxWeightRollup", "rollup">;
  trainingNameFormula: NotionProp<"trainingNameFormula", "formula">;
  exerciseSetsRelation: NotionProp<"exerciseSetsRelation", "relation">;
  setsJsonFormula: NotionProp<"setsJsonFormula", "formula">;
  rest: NotionProp<"rest", "number">;
  memo: NotionProp<"memo", "rich_text">;
}

export type ExtractExerciseLog<T extends keyof ExerciseLogProperties> =
  BasePageMeta & {
    properties: Pick<ExerciseLogProperties, T>;
  };
