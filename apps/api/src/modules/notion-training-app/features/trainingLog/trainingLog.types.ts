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
    name: NotionProp<"name", "title">;
  };
};
export type TrainingLogData = NotionResults<TrainingLog>;
export type TrainingLogResponse = {
  createdTime: string;
  bodyWeight: number | null;
  memo: string;
  exercises: {
    name: string | null;
    todayMaxWeight: number | null;
    rest: number | null;
    memo: string;
    sets: {
      kg: number;
      rep: number;
      memo: string;
      displayText: string;
    }[];
  }[];
};
