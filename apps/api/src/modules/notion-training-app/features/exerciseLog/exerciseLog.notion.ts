import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseLogData,
  ExerciseLogDetailData,
  ExerciseLogResponse,
  ExerciseLogsResponse,
} from "./exerciseLog.types";
import {
  getFormula,
  getRelatonIds,
  getRollup,
} from "@/integrations/notion/notion.mapper";

import { ExerciseSet } from "../exerciseSet/exerciseSet.types";

export async function fetchExerciseLogs(
  exerciseId: string,
  limit: number = 20,
  start_cursor?: string,
) {
  const logs: ExerciseLogData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
    filter: {
      property: "trainingExerciseRelation",
      relation: {
        contains: exerciseId,
      },
    },
    filter_properties: [
      "todayMaxWeightRollup",
      "exerciseSetsRelation",
      "rest",
      "trainingNameFormula",
      "createdDate",
    ],
    page_size: limit,
    start_cursor: start_cursor,
  })) as unknown as ExerciseLogData;
  const responseData: ExerciseLogsResponse = {
    data: logs.results.map((log) => ({
      id: log.id,
      createdTime: log.created_time,
      todayMaxWeight:
        getRollup(log.properties.todayMaxWeightRollup, "number") || 0,
      rest: log.properties.rest.number || 0,
      trainingName:
        getFormula(log.properties.trainingNameFormula, "string") || "",
      exerciseSetsIds: log.properties.exerciseSetsRelation.relation.map(
        (relation) => relation.id,
      ),
    })),
    next_cursor: logs.next_cursor || undefined,
    has_more: logs.has_more,
  };
  return responseData;
}
export async function fetchExerciseLog(exerciseLogId: string) {
  const log: ExerciseLogDetailData = (await notionClient.pages.retrieve({
    page_id: exerciseLogId,
    filter_properties: [
      "todayMaxWeightRollup",
      "exerciseSetsRelation",
      "rest",
      "trainingNameFormula",
      "createdDate",
    ],
  })) as unknown as ExerciseLogDetailData;
  const exerciseSetsIds = getRelatonIds(log.properties.exerciseSetsRelation);
  const exerciseSets: ExerciseSet[] = (await Promise.all(
    exerciseSetsIds.map((id) =>
      notionClient.pages.retrieve({
        page_id: id,
        filter_properties: [
          "kg",
          "rep",
          "memo",
          "detailFormula",
          "maxWeightFormula",
        ],
      }),
    ),
  )) as unknown as ExerciseSet[];
  const responseData: ExerciseLogResponse = {
    id: log.id,
    createdTime: log.created_time,
    todayMaxWeight:
      getRollup(log.properties.todayMaxWeightRollup, "number") || 0,
    rest: log.properties.rest.number || 0,
    trainingName:
      getFormula(log.properties.trainingNameFormula, "string") || "",
    exerciseSets: exerciseSets.map((set) => ({
      id: set.id,
      kg: set.properties.kg.number || 0,
      rep: set.properties.rep.number || 0,
      memo: set.properties.memo.rich_text[0]?.plain_text || "",
      displayText: getFormula(set.properties.detailFormula, "string") || "",
      maxWeight: getFormula(set.properties.maxWeightFormula, "number") || 0,
    })),
  };
  return responseData;
}
