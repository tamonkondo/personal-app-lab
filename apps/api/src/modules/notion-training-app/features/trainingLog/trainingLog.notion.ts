import notionClient from "@/integrations/notion/notion.client";

import {
  getFormula,
  getRollup,
  getTitle,
} from "@/integrations/notion/notion.mapper";
import { TrainingLog, TrainingLogResponse } from "./trainingLog.types";
import { ExerciseLog } from "../exerciseLog/exerciseLog.types";
import { ExerciseSet } from "../exerciseSet/exerciseSet.types";

// トレーニングログ一覧の取得
export async function fetchTrainingLogs(cursor?: string, limit: number = 20) {
  const trainingLogs = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: limit,
    start_cursor: cursor,
    filter_properties: [
      "memo",
      "trainingExercisesRelation",
      "createdTime",
      "bodyWeight",
    ],
  })) as unknown as TrainingLog[];
  return trainingLogs;
}
// トレーニングログの取得
export async function fetchTrainingLog(id: string) {
  const trainingLog: TrainingLog = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: [
      "memo",
      "trainingExercisesRelation",
      "createdTime",
      "bodyWeight",
    ],
  })) as unknown as TrainingLog;
  return trainingLog;
}
// トレーニングログの取得（トレーニング種目のログも含む）
export async function fetchTrainingLogDetail(id: string) {
  const trainingLog: TrainingLog = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: [
      "memo",
      "trainingExercisesRelation",
      "createdTime",
      "bodyWeight",
    ],
  })) as TrainingLog;
  const trainingExercisesRelationIds =
    trainingLog.properties.trainingExercisesRelation.relation?.map(
      (relation) => relation.id,
    );
  const exerciseLogs: ExerciseLog[] = (await Promise.all(
    trainingExercisesRelationIds?.map((id) =>
      notionClient.pages.retrieve({
        page_id: id,
        filter_properties: [
          "todayMaxWeightRollup",
          "trainingNameFormula",
          "exerciseSetsRelation",
          "rest",
          "memo",
        ],
      }),
    ) || [],
  )) as ExerciseLog[];
  const exerciseSetsRelationIds = exerciseLogs.flatMap(
    (exerciseLog) =>
      exerciseLog.properties.exerciseSetsRelation.relation?.map(
        (relation) => relation.id,
      ) || [],
  );
  const exerciseSets: ExerciseSet[] = (await Promise.all(
    exerciseSetsRelationIds.map((id) =>
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
  const responseData: TrainingLogResponse = {
    createdTime: trainingLog.properties.createdTime.created_time,
    bodyWeight: trainingLog.properties.bodyWeight.number,
    memo: trainingLog.properties.memo.rich_text[0]?.plain_text || "",
    exercises: exerciseLogs.map((exerciseLog) => ({
      name:
        getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
      todayMaxWeight:
        Number(
          getRollup(exerciseLog.properties.todayMaxWeightRollup, "number"),
        ) || 0,
      rest: exerciseLog.properties.rest.number,
      memo: getTitle(exerciseLog.properties.memo),
      sets: exerciseSets
        .filter((exerciseDetailLog) =>
          exerciseLog.properties.exerciseSetsRelation.relation?.some(
            (relation) => relation.id === exerciseDetailLog.id,
          ),
        )
        .map((exerciseDetailLog) => ({
          kg: exerciseDetailLog.properties.kg.number || 0,
          rep: exerciseDetailLog.properties.rep.number || 0,
          memo: getTitle(exerciseDetailLog.properties.memo),
          detailFormula:
            getFormula(exerciseDetailLog.properties.detailFormula, "string") ||
            "",
        })),
    })),
  };
  return responseData;
}
