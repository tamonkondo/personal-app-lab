/**
 * 各NotionのAPIを呼び出す関数
 * */
import notionClient from "@/integrations/notion/notion.client";
import { TrainingLog } from "./notion-training-app.types";

export async function fetchTrainingLogs() {
  const trainingLogs = await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: 6,
  });
  return trainingLogs.results;
}
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
  const trainingExercisesRelationIds =
    trainingLog.properties.trainingExercisesRelation.relation?.map(
      (relation) => relation.id,
    );
  const exerciseLogs = await Promise.all(
    trainingExercisesRelationIds?.map((id) =>
      notionClient.pages.retrieve({
        page_id: id,
        filter_properties: [
          "todayMaxWeightRollup",
          "exerciseDetailLogsRelation",
          "rest",
          "memo",
        ],
      }),
    ) || [],
  );
  // 途中まで。ここから各exerciseLogに対して、exerciseDetailLogsRelationからさらにNotion APIを呼び出して、exerciseDetailLogを取得する必要がある。
  return exerciseLogs[1];
}
export async function fetchGoalsWeight() {}
export async function fetchExerciseReference() {}
export async function fetchExerciseReferenceDetail() {}
export async function fetchExerciseLogs() {}
export async function fetchExerciseDetailLogs() {}
export async function fetchExerciseDetailLog() {}
