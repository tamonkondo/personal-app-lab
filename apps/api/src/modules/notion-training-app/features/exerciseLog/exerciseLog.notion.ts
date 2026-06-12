import notionClient from "@/integrations/notion/notion.client";
import { ExerciseLogData, ExerciseLogsResponse } from "./exerciseLog.types";
import { getFormula, getRollup } from "@/integrations/notion/notion.mapper";

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

// トレーニング種目の取得、ただしゴールデータがあるものに限定する
