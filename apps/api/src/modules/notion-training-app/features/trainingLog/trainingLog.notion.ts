import notionClient from "@/integrations/notion/notion.client";

import {
  getFormula,
  getRelatonIds,
  getRollup,
  getTitle,
} from "@/integrations/notion/notion.mapper";
import {
  TrainingLog,
  TrainingLogData,
  TrainingLogWithExerciseResponse,
} from "./trainingLog.types";
import { ExerciseLogDetailData } from "../exerciseLog/exerciseLog.types";
import { ExerciseSet } from "../exerciseSet/exerciseSet.types";

const FILTER_PROPERTIES = [
  "memo",
  "trainingExercisesRelation",
  "createdTime",
  "bodyWeight",
];

// トレーニングログ一覧の取得
// /api/notion-training-app/training-logs/?cursor=xxx&limit=20
export async function fetchTrainingLogs(cursor?: string, limit: number = 20) {
  const trainingLogs: TrainingLogData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: limit,
    start_cursor: cursor,
    filter_properties: FILTER_PROPERTIES,
  })) as unknown as TrainingLogData;
  const responseData = trainingLogs.results.map((trainingLog) => ({
    trainingExercisesRelation: getRelatonIds(
      trainingLog.properties.trainingExercisesRelation,
    ),
    createdTime: trainingLog.properties.createdTime.created_time,
    bodyWeight: trainingLog.properties.bodyWeight.number || 0,
    memo: trainingLog.properties.memo.rich_text[0]?.plain_text || "",

    id: trainingLog.id,
  }));
  return responseData;
}

//
// トレーニングログの取得
// /api/notion-training-app/training-logs/:id
export async function fetchTrainingLog(id: string) {
  const trainingLog: TrainingLog = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: FILTER_PROPERTIES,
  })) as unknown as TrainingLog;
  return trainingLog;
}
// トレーニングログの取得（トレーニング種目のログも含む）
// /api/notion-training-app/training-logs/:id/detail
export async function fetchTrainingLogDetail(id: string) {
  const trainingLog: TrainingLog = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: FILTER_PROPERTIES,
  })) as TrainingLog;
  const trainingExercisesRelationIds =
    trainingLog.properties.trainingExercisesRelation.relation?.map(
      (relation) => relation.id,
    );
  // トレーニング種目の各ログを取得
  const exerciseLogs: ExerciseLogDetailData[] = (await Promise.all(
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
  )) as ExerciseLogDetailData[];
  const exerciseSetsRelationIds = exerciseLogs.flatMap(
    (exerciseLog) =>
      getRelatonIds(exerciseLog.properties.exerciseSetsRelation) || [],
  );
  const exerciseSets: Omit<ExerciseSet, "maxWeightFormula">[] =
    (await Promise.all(
      exerciseSetsRelationIds.map((id) =>
        notionClient.pages.retrieve({
          page_id: id,
          filter_properties: ["kg", "rep", "memo", "detailFormula"],
        }),
      ),
    )) as unknown as ExerciseSet[];
  const responseData: TrainingLogWithExerciseResponse = {
    createdTime: trainingLog.properties.createdTime.created_time,
    bodyWeight: trainingLog.properties.bodyWeight.number || 0,
    memo: trainingLog.properties.memo.rich_text[0]?.plain_text || "",
    exercises: exerciseLogs.map((exerciseLog) => ({
      name:
        getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
      todayMaxWeight:
        Number(
          getRollup(exerciseLog.properties.todayMaxWeightRollup, "number"),
        ) || 0,
      rest: exerciseLog.properties.rest.number || 0,
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
          displayText:
            getFormula(exerciseDetailLog.properties.detailFormula, "string") ||
            "",
        })),
    })),
  };
  return responseData;
}

// 最新のトレーニングログの取得
export async function fetchNewestTrainingLog() {
  // 最新のトレーニングログを1件取得するクエリ
  const newestLog = await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: 1,
    sorts: [
      {
        property: "createdTime",
        direction: "descending",
      },
    ],
  });
  // リレーションですべてのトレーニング種目を取得するために、最新のトレーニングログのIDを取得
  const relationIds = getRelatonIds(
    (newestLog as unknown as TrainingLogData).results[0].properties
      .trainingExercisesRelation,
  );
  const logs = newestLog as unknown as TrainingLogData;
  if (logs.results.length === 0) {
    return null; // ログが存在しない場合はnullを返す
  }
  const log = logs.results[0];

  return log;
}
