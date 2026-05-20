import {
  BasePageMeta,
  NotionProp,
  NotionResults,
} from "@/integrations/notion/notion.types";

export type GoalWeight = BasePageMeta & {
  properties: {
    exerciseNameFormula: NotionProp<"exerciseNameFormula", "rich_text">;
    maxWeightRollup: NotionProp<"maxWeightRollup", "rollup">;
    updateDateRollup: NotionProp<"updateDateRollup", "rollup">;
    goalWeight: NotionProp<"goalWeight", "number">;
    statusFormula: NotionProp<"statusFormula", "formula">;
  };
};

export type GoalWeightData = NotionResults<GoalWeight>;

export type GoalWeightResponse = {
  id: string;
  exerciseName: string;
  maxWeight: number;
  updateDate: string | undefined;
  goalWeight: number;
  status: string;
};
