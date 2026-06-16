import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";


export type NotionTrainingLogProperties = {
  memo: NotionProp<"memo", "rich_text">;
  trainingExercisesRelation: NotionProp<
    "trainingExercisesRelation",
    "relation"
  >;
  createdTime: NotionProp<"createdTime", "created_time">;
  bodyWeight: NotionProp<"bodyWeight", "number">;
};

export type NotionTrainingLogPage = BasePageMeta & {
  properties: NotionTrainingLogProperties;
};

export type NotionTrainingLogQueryResult = NotionResults<NotionTrainingLogPage>;
