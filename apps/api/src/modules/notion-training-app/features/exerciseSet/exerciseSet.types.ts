import {
  NotionPageResults,
  NotionProp,
} from "@/integrations/notion/notion.types";

type NotionExerciseSetWeightProperties = {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
};

export type NotionExerciseSetWeightPage =
  NotionPageResults<NotionExerciseSetWeightProperties>;
