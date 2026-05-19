/**
 * 各NotionのAPIを呼び出す関数
 * */
import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseDetailLog,
  ExerciseLog,
  TrainingLog,
  TrainingLogResponse,
} from "./notion-training-app.types";
import { getFormula, getRollup } from "./notion-training-app.mapper";

// トレーニングログ一覧の取得
export async function fetchTrainingLogs() {
  const trainingLogs = await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: 1,
  });
  return trainingLogs.results;
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
          "exerciseDetailLogsRelation",
          "rest",
          "memo",
        ],
      }),
    ) || [],
  )) as ExerciseLog[];
  const exerciseDetailLogsRelationIds = exerciseLogs.flatMap(
    (exerciseLog) =>
      exerciseLog.properties.exerciseDetailLogsRelation.relation?.map(
        (relation) => relation.id,
      ) || [],
  );
  const exerciseDetailLogs: ExerciseDetailLog[] = (await Promise.all(
    exerciseDetailLogsRelationIds.map((id) =>
      notionClient.pages.retrieve({
        page_id: id,
        filter_properties: [
          "kg",
          "rep",
          "memo",
          "detailFormula",
          "maxWeightFormula",
          "createdTime",
        ],
      }),
    ),
  )) as ExerciseDetailLog[];
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
      memo: exerciseLog.properties.memo.rich_text[0]?.plain_text || "",
      sets: exerciseDetailLogs
        .filter((exerciseDetailLog) =>
          exerciseLog.properties.exerciseDetailLogsRelation.relation?.some(
            (relation) => relation.id === exerciseDetailLog.id,
          ),
        )
        .map((exerciseDetailLog) => ({
          kg: exerciseDetailLog.properties.kg.number || 0,
          rep: exerciseDetailLog.properties.rep.number || 0,
          memo:
            exerciseDetailLog.properties.memo.rich_text[0]?.plain_text || "",
          detailFormula:
            getFormula(exerciseDetailLog.properties.detailFormula, "string") ||
            "",
          createdTime: exerciseDetailLog.properties.createdTime.created_time,
        })),
    })),
  };
  return responseData;
}
export async function fetchGoalsWeight() {}
export async function fetchExerciseReference() {}
export async function fetchExerciseReferenceDetail() {}
export async function fetchExerciseLogs() {}
export async function fetchExerciseDetailLogs() {}
export async function fetchExerciseDetailLog() {}
