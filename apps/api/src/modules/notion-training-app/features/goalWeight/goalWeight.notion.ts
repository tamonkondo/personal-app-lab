import notionClient from "@/integrations/notion/notion.client";

import {
  getFormula,
  getRollup,
  getRollupFormulaDate,
} from "@/integrations/notion/notion.mapper";
import {
  GoalWeight,
  GoalWeightData,
  GoalWeightResponse,
} from "./goalWeight.types";

// 目標重量の一覧取得
export async function fetchGoalWeights() {
  const goalWeights: GoalWeightData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_GOAL_WEIGHTS_DATABASE_ID!,
    filter_properties: [
      "exerciseNameFormula",
      "maxWeightRollup",
      "updateDateRollup",
      "goalWeight",
      "statusFormula",
    ],
  })) as unknown as GoalWeightData;
  const responseData: GoalWeightResponse[] = goalWeights.results.map(
    (goalWeight) => ({
      id: goalWeight.id,
      exerciseName:
        getFormula(goalWeight.properties.exerciseNameFormula, "string") || "",
      maxWeight:
        Number(getRollup(goalWeight.properties.maxWeightRollup, "number")) || 0,
      updateDate: getRollupFormulaDate(goalWeight.properties.updateDateRollup)
        ?.start,
      goalWeight: goalWeight.properties.goalWeight.number || 0,
      status: getFormula(goalWeight.properties.statusFormula, "string") || "",
    }),
  );
  return responseData;
}
// 目標重量の取得
export async function fetchGoalWeightsDetail(id: string) {
  const goalWeight: GoalWeight = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: [
      "exerciseNameFormula",
      "maxWeightRollup",
      "updateDateRollup",
      "goalWeight",
      "statusFormula",
    ],
  })) as unknown as GoalWeight;
  const responseData: GoalWeightResponse = {
    id: goalWeight.id,
    exerciseName:
      getFormula(goalWeight.properties.exerciseNameFormula, "string") || "",
    maxWeight:
      Number(getRollup(goalWeight.properties.maxWeightRollup, "number")) || 0,
    updateDate: getRollupFormulaDate(goalWeight.properties.updateDateRollup)
      ?.start,
    goalWeight: goalWeight.properties.goalWeight.number || 0,
    status: getFormula(goalWeight.properties.statusFormula, "string") || "",
  };
  return responseData;
}
