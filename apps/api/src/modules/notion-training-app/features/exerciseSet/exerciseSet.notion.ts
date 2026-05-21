import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseSetDetailData,
  ExerciseSetResponse,
  ExerciseSetsData,
  ExerciseSetsResponse,
} from "./exerciseSet.types";
import { getFormula } from "@/integrations/notion/notion.mapper";

export async function fetchExerciseSets(
  limit: number = 20,
  start_cursor?: string,
) {
  const logs = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_EXERCISE_SETS_DATABASE_ID!,
    start_cursor: start_cursor,
    page_size: limit,
  })) as unknown as ExerciseSetsData;
  const responseData: ExerciseSetsResponse = {
    data: logs.results.map((log) => ({
      id: log.id,
      createdTime: log.created_time,
      kg: log.properties.kg.number || 0,
      rep: log.properties.rep.number || 0,
      memo: log.properties.memo.rich_text[0]?.plain_text || "",
      detail: getFormula(log.properties.detailFormula, "string") || "",
      maxWeight: getFormula(log.properties.maxWeightFormula, "number") || 0,
    })),
    next_cursor: logs.next_cursor || undefined,
    has_more: logs.has_more,
  };
  return responseData;
}
export async function fetchExerciseSet(id: string) {
  const log: ExerciseSetDetailData = (await notionClient.pages.retrieve({
    page_id: id,
  })) as unknown as ExerciseSetDetailData;
  const responseData: ExerciseSetResponse = {
    id: log.id,
    kg: log.properties.kg.number || 0,
    rep: log.properties.rep.number || 0,
    memo: log.properties.memo.rich_text[0]?.plain_text || "",
    detail: getFormula(log.properties.detailFormula, "string") || "",
    maxWeight: getFormula(log.properties.maxWeightFormula, "number") || 0,
    createdTime: log.created_time,
  };
  return responseData;
}
export async function fetchExerciseSetDetail() {}
