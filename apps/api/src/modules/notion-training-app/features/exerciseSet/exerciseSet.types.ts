import {
  NotionPageResults,
  NotionProp,
} from "@/integrations/notion/notion.types";

type ExerciseSetWeightProperties = {
  kg: NotionProp<"kg", "number">;
  rep: NotionProp<"rep", "number">;
};

export type ExerciseSetWeightData =
  NotionPageResults<ExerciseSetWeightProperties>;
