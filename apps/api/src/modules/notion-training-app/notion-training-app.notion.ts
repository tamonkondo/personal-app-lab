/**
 * 各NotionのAPIを呼び出す関数
 * */
import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseDetailLog,
  ExerciseLog,
  GoalWeight,
  GoalWeightData,
  GoalWeightResponse,
  TrainingLog,
  TrainingLogResponse,
} from "./notion-training-app.types";
import {
  getFormula,
  getRollup,
  getRollupFormulaDate,
} from "@/integrations/notion/notion.mapper";

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
export async function fetchExerciseReference() {}
export async function fetchExerciseReferenceDetail() {}
export async function fetchExerciseLogs() {}
export async function fetchExerciseDetailLogs() {}
export async function fetchExerciseDetailLog() {}
