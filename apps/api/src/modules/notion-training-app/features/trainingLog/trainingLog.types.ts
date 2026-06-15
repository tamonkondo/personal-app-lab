import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type TrainingLog = BasePageMeta & {
  properties: {
    memo: NotionProp<"memo", "rich_text">;
    trainingExercisesRelation: NotionProp<
      "trainingExercisesRelation",
      "relation"
    >;
    createdTime: NotionProp<"createdTime", "created_time">;
    bodyWeight: NotionProp<"bodyWeight", "number">;
  };
};
export type TrainingLogData = NotionResults<TrainingLog>;
